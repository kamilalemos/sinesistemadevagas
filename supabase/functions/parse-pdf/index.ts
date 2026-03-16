import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getDocument } from "https://esm.sh/pdfjs-serverless";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_CHUNK_CHARS = 12000;
const LINE_Y_TOLERANCE = 4;

const VALID_CATEGORIES = new Set([
  "Tecnologia",
  "Administrativo",
  "Vendas",
  "Marketing",
  "Logística",
  "Indústria",
  "Saúde",
  "Construção",
  "Alimentação",
  "Serviços",
]);

const SUMMARY_ROW_REGEX = /(total de vagas|total geral|vagas abertas|feirão da empregabilidade|quantidade total|total\b)/i;
const HEADER_REGEX = /(qtd|cbo|vaga|cargo|código|escolaridade|experiência|observações|descrição da vaga|vagas de emprego)/i;

const COLUMN_BOUNDS = {
  qtd: 145,
  cbo: 245,
  cargo: 500,
  escolaridade: 700,
  experiencia: 890,
  numeroVaga: 1025,
};

const buildPrompt = (text: string) => `Você é um extrator de dados de vagas de emprego. Analise o texto abaixo extraído de um documento do SINE (Sistema Nacional de Emprego) e extraia ABSOLUTAMENTE TODAS as vagas encontradas.

REGRAS CRÍTICAS:
1. Extraia CADA LINHA da tabela como uma vaga separada. NÃO agrupe nem some vagas com o mesmo cargo.
2. O valor "qtd" deve ser EXATAMENTE o número isolado da coluna "Qtd" ou "Quantidade" da linha específica.
3. NUNCA concatene números de colunas vizinhas. Exemplo: se a linha tiver CBO 2201 e Qtd 15, o campo qtd deve ser 15, nunca 220115.
4. NUNCA inclua cabeçalhos, subtítulos, observações, totais, linhas-resumo ou frases como "Vagas abertas para o feirão da empregabilidade".
5. Se o mesmo cargo aparecer múltiplas vezes com descrições ou requisitos diferentes, cada uma deve ser uma entrada SEPARADA.
6. NÃO ignore nenhuma linha real da tabela. Cada linha da tabela = uma entrada no array.

Para cada vaga, retorne um objeto JSON com:
- qtd: número EXATO de vagas conforme a coluna Qtd (inteiro positivo)
- cbo: código CBO se disponível (string, ex: "5173-30"), ou string vazia
- cargo: nome do cargo (string)
- escolaridade: nível de escolaridade exigido (string)
- experiencia: experiência exigida (string)
- descricao: descrição/observação adicional da vaga (string)
- categoria: uma dessas categorias: "Tecnologia", "Administrativo", "Vendas", "Marketing", "Logística", "Indústria", "Saúde", "Construção", "Alimentação", "Serviços"

Responda APENAS com um JSON válido no formato: {"vagas": [...]}.

Texto extraído:
${text}`;

type ParsedVaga = {
  qtd: number;
  cbo: string;
  cargo: string;
  escolaridade: string;
  experiencia: string;
  descricao: string;
  categoria: string;
};

type TableLine = {
  qtd: string;
  cbo: string;
  cargo: string;
  escolaridade: string;
  experiencia: string;
  numeroVaga: string;
  descricao: string;
};

type TextItem = {
  text: string;
  x: number;
  y: number;
};

async function callAI(apiKey: string, text: string): Promise<any[]> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: buildPrompt(text) }],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("AI error:", errText);
    throw new Error("Erro ao processar com IA: " + response.status);
  }

  const aiData = await response.json();
  const content = aiData.choices?.[0]?.message?.content || "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error("AI response not JSON:", content.substring(0, 500));
    throw new Error("Não foi possível interpretar a resposta da IA");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.vagas || [];
}

function splitIntoChunks(text: string, maxChars: number): string[] {
  const lines = text.split("\n");
  const chunks: string[] = [];
  let currentChunk = "";

  for (const line of lines) {
    if (currentChunk.length + line.length + 1 > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = "";
    }
    currentChunk += (currentChunk ? "\n" : "") + line;
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function normalizeText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : fallback;
}

function appendText(current: string, next: string): string {
  const normalized = normalizeText(next);
  if (!normalized) return current;
  if (!current) return normalized;
  if (current.includes(normalized)) return current;
  return `${current} ${normalized}`.trim();
}

function normalizeQtd(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 9999) {
    return value;
  }

  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits || digits.length > 4) {
    return null;
  }

  const parsed = Number.parseInt(digits, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function getColumnByX(x: number): keyof TableLine {
  if (x < COLUMN_BOUNDS.qtd) return "qtd";
  if (x < COLUMN_BOUNDS.cbo) return "cbo";
  if (x < COLUMN_BOUNDS.cargo) return "cargo";
  if (x < COLUMN_BOUNDS.escolaridade) return "escolaridade";
  if (x < COLUMN_BOUNDS.experiencia) return "experiencia";
  if (x < COLUMN_BOUNDS.numeroVaga) return "numeroVaga";
  return "descricao";
}

function createEmptyLine(): TableLine {
  return {
    qtd: "",
    cbo: "",
    cargo: "",
    escolaridade: "",
    experiencia: "",
    numeroVaga: "",
    descricao: "",
  };
}

function isNoiseLine(line: TableLine): boolean {
  const values = Object.values(line).filter(Boolean);
  if (values.length === 0) return true;

  const combined = values.join(" ").toLowerCase();
  if (HEADER_REGEX.test(combined)) return true;
  if (/^\d+$/.test(combined) && combined.length <= 2) return true;
  if (/^page\s+\d+$/i.test(combined)) return true;
  return false;
}

function lineStartsNewRow(line: TableLine): boolean {
  return normalizeQtd(line.qtd) !== null && Boolean(normalizeText(line.cargo));
}

function mergeLines(base: TableLine, extra: TableLine): TableLine {
  return {
    qtd: base.qtd || extra.qtd,
    cbo: appendText(base.cbo, extra.cbo),
    cargo: appendText(base.cargo, extra.cargo),
    escolaridade: appendText(base.escolaridade, extra.escolaridade),
    experiencia: appendText(base.experiencia, extra.experiencia),
    numeroVaga: appendText(base.numeroVaga, extra.numeroVaga),
    descricao: appendText(base.descricao, extra.descricao),
  };
}

function categorizeVaga(cargo: string, descricao: string): string {
  const text = `${cargo} ${descricao}`.toLowerCase();

  const rules: Array<[string, string[]]> = [
    ["Tecnologia", ["programador", "desenvolvedor", "sistemas", "informática", "ti", "software", "suporte técnico"]],
    ["Marketing", ["marketing", "social media", "publicidade", "conteúdo", "tráfego"]],
    ["Saúde", ["enferm", "farmácia", "farmac", "saúde", "clínica", "hospital", "odont"]],
    ["Construção", ["pedreiro", "pintor", "obras", "constru", "serralheiro", "eletricista", "encanador"]],
    ["Logística", ["estoque", "almoxarifado", "expedi", "logística", "carga", "descarga", "motorista", "depósito"]],
    ["Alimentação", ["cozinha", "garçom", "açougue", "cafeteria", "lanchonete", "padaria", "confeitaria", "copeiro", "churrasqueiro", "cozinheiro"]],
    ["Indústria", ["produção", "máquina", "industrial", "costureira", "pcp", "fiação", "mecânico"]],
    ["Vendas", ["vendas", "vendedor", "caixa", "balconista", "atendente de loja", "consultor", "telemarketing", "comercial"]],
    ["Administrativo", ["administrativo", "recepcionista", "financeiro", "analista", "arquivista", "assistente", "planejamento", "pessoal"]],
  ];

  for (const [category, keywords] of rules) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category;
    }
  }

  return "Serviços";
}

function normalizeVaga(raw: Partial<TableLine>): ParsedVaga | null {
  const cargo = normalizeText(raw.cargo);
  const qtd = normalizeQtd(raw.qtd);

  if (!cargo || !qtd || SUMMARY_ROW_REGEX.test(cargo)) {
    return null;
  }

  const cbo = normalizeText(raw.cbo).replace(/[^\d-]/g, "");
  const escolaridade = normalizeText(raw.escolaridade, "Não informado");
  const experiencia = normalizeText(raw.experiencia, "Não informada");
  const descricao = normalizeText(raw.descricao);
  const categoria = categorizeVaga(cargo, descricao);

  return {
    qtd,
    cbo,
    cargo,
    escolaridade,
    experiencia,
    descricao,
    categoria: VALID_CATEGORIES.has(categoria) ? categoria : "Serviços",
  };
}

function buildLine(items: TextItem[]): TableLine {
  const line = createEmptyLine();

  for (const item of items.sort((a, b) => a.x - b.x)) {
    const column = getColumnByX(item.x);
    line[column] = appendText(line[column], item.text);
  }

  return line;
}

function groupItemsIntoLines(items: TextItem[]): TextItem[][] {
  const sorted = [...items].sort((a, b) => {
    if (Math.abs(a.y - b.y) <= LINE_Y_TOLERANCE) {
      return a.x - b.x;
    }
    return b.y - a.y;
  });

  const lines: TextItem[][] = [];

  for (const item of sorted) {
    const lastLine = lines[lines.length - 1];
    if (!lastLine) {
      lines.push([item]);
      continue;
    }

    const referenceY = lastLine[0].y;
    if (Math.abs(referenceY - item.y) <= LINE_Y_TOLERANCE) {
      lastLine.push(item);
    } else {
      lines.push([item]);
    }
  }

  return lines;
}

function extractTextItems(textContent: any): TextItem[] {
  return (textContent.items || [])
    .filter((item: any) => typeof item?.str === "string" && item.str.trim())
    .map((item: any) => ({
      text: item.str.trim(),
      x: Number(item.transform?.[4] ?? 0),
      y: Number(item.transform?.[5] ?? 0),
    }));
}

async function parsePdfTable(buffer: Uint8Array, onProgress?: (current: number, total: number) => void): Promise<ParsedVaga[]> {
  const loadingTask = getDocument({ data: buffer, useSystemFonts: true });
  const pdf = await loadingTask.promise;
  const vagas: ParsedVaga[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const textItems = extractTextItems(textContent);
    const groupedLines = groupItemsIntoLines(textItems);

    let currentRow: TableLine | null = null;

    for (const items of groupedLines) {
      const line = buildLine(items);
      if (isNoiseLine(line)) continue;

      if (lineStartsNewRow(line)) {
        const normalizedPrevious = currentRow ? normalizeVaga(currentRow) : null;
        if (normalizedPrevious) {
          vagas.push(normalizedPrevious);
        }
        currentRow = line;
        continue;
      }

      if (currentRow) {
        currentRow = mergeLines(currentRow, line);
      }
    }

    const normalizedLast = currentRow ? normalizeVaga(currentRow) : null;
    if (normalizedLast) {
      vagas.push(normalizedLast);
    }

    page.cleanup();
    onProgress?.(pageNumber, pdf.numPages);
  }

  return vagas;
}

async function parseTextWithAI(text: string, apiKey: string, onProgress?: (current: number, total: number) => void): Promise<ParsedVaga[]> {
  const chunks = splitIntoChunks(text, MAX_CHUNK_CHARS);
  let vagas: ParsedVaga[] = [];
  const batchSize = 3;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((chunk, idx) => {
        console.log(`Processando parte ${i + idx + 1}/${chunks.length} (${chunk.length} chars)...`);
        return callAI(apiKey, chunk).catch((err) => {
          console.error(`Erro na parte ${i + idx + 1}:`, err.message);
          return [] as any[];
        });
      }),
    );

    for (const batchVagas of results) {
      vagas = vagas.concat(batchVagas.map(normalizeVaga).filter((vaga): vaga is ParsedVaga => Boolean(vaga)));
    }

    onProgress?.(Math.min(i + batchSize, chunks.length), chunks.length);
  }

  return vagas;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "Nenhum arquivo enviado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          let vagas: ParsedVaga[] = [];

          if (isPDF) {
            const buffer = new Uint8Array(await file.arrayBuffer());
            send({ type: "progress", step: "extract", message: "Lendo tabela do PDF", current: 0, total: 1 });
            vagas = await parsePdfTable(buffer, (current, total) => {
              send({ type: "progress", step: "pdf", message: `Lendo página ${current}/${total}`, current, total });
            });
          } else {
            const extractedText = await file.text();
            if (!extractedText || extractedText.trim().length < 10) {
              throw new Error("Não foi possível extrair texto do arquivo");
            }

            const apiKey = Deno.env.get("LOVABLE_API_KEY");
            if (!apiKey) {
              throw new Error("API key não configurada");
            }

            send({ type: "progress", step: "extract", message: "Texto extraído do arquivo", current: 0, total: 1 });
            vagas = await parseTextWithAI(extractedText, apiKey, (current, total) => {
              send({ type: "progress", step: "ai", message: `Processando parte ${current}/${total}`, current, total });
            });
          }

          const totalVagas = vagas.reduce((sum, vaga) => sum + vaga.qtd, 0);
          console.log(`Total extraído: ${vagas.length} vagas válidas -> ${totalVagas} vagas total`);
          send({ type: "done", vagas, totalVagas });
        } catch (err) {
          send({ type: "error", error: err instanceof Error ? err.message : "Erro desconhecido" });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Parse error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MAX_CHUNK_CHARS = 12000;

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

async function callAI(apiKey: string, text: string): Promise<any[]> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
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
  return typeof value === "string" ? value.trim() : fallback;
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

function normalizeVaga(raw: any) {
  const cargo = normalizeText(raw?.cargo);
  const qtd = normalizeQtd(raw?.qtd);

  if (!cargo || !qtd || SUMMARY_ROW_REGEX.test(cargo)) {
    return null;
  }

  return {
    qtd,
    cbo: normalizeText(raw?.cbo) || "",
    cargo,
    escolaridade: normalizeText(raw?.escolaridade, "Não informado"),
    experiencia: normalizeText(raw?.experiencia, "Não informada"),
    descricao: normalizeText(raw?.descricao),
    categoria: VALID_CATEGORIES.has(raw?.categoria) ? raw.categoria : "Serviços",
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "Nenhum arquivo enviado" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let extractedText: string;
    const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (isPDF) {
      const { default: pdfParse } = await import("npm:pdf-parse@1.1.1");
      const buffer = await file.arrayBuffer();
      const pdfData = await pdfParse(new Uint8Array(buffer));
      extractedText = pdfData.text;
    } else {
      extractedText = await file.text();
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return new Response(JSON.stringify({ error: "Não foi possível extrair texto do arquivo" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Split at line boundaries
    const chunks = splitIntoChunks(extractedText, MAX_CHUNK_CHARS);
    const totalChunks = chunks.length;
    console.log(`Texto total: ${extractedText.length} chars, ${extractedText.split('\n').length} linhas, dividido em ${totalChunks} parte(s)`);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          send({ type: "progress", step: "extract", message: "Texto extraído do arquivo", current: 0, total: totalChunks });

          let allVagas: any[] = [];
          const batchSize = 3;

          for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            const results = await Promise.all(
              batch.map((chunk, idx) => {
                console.log(`Processando parte ${i + idx + 1}/${totalChunks} (${chunk.length} chars)...`);
                return callAI(apiKey, chunk).catch((err) => {
                  console.error(`Erro na parte ${i + idx + 1}:`, err.message);
                  return [] as any[];
                });
              })
            );
            for (const vagas of results) {
              allVagas = allVagas.concat(vagas);
            }

            const processed = Math.min(i + batchSize, totalChunks);
            send({ type: "progress", step: "ai", message: `Processando parte ${processed}/${totalChunks}`, current: processed, total: totalChunks });
          }

          // Deduplicate only truly identical entries (same cargo + cbo + escolaridade + experiencia + descricao)
          const vagaMap = new Map<string, any>();
          for (const v of allVagas) {
            const key = `${(v.cargo || '').trim().toLowerCase()}|${(v.cbo || '').trim()}|${(v.escolaridade || '').trim().toLowerCase()}|${(v.experiencia || '').trim().toLowerCase()}|${(v.descricao || '').trim().toLowerCase().substring(0, 80)}`;
            if (vagaMap.has(key)) {
              // True duplicate from chunk overlap — keep the one with higher qtd
              const existing = vagaMap.get(key);
              existing.qtd = Math.max(existing.qtd || 0, v.qtd || 0);
            } else {
              vagaMap.set(key, { ...v, qtd: v.qtd || 1 });
            }
          }
          const vagas = Array.from(vagaMap.values());
          const totalVagas = vagas.reduce((sum: number, v: any) => sum + (v.qtd || 0), 0);

          console.log(`Total extraído: ${allVagas.length} entradas brutas -> ${vagas.length} vagas únicas -> ${totalVagas} vagas total`);

          send({ type: "done", vagas, totalVagas });
        } catch (err) {
          send({ type: "error", error: err.message });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error("Parse error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

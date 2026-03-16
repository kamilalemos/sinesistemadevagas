import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_CHUNK_CHARS = 12000;

const VALID_CATEGORIES = new Set([
  "Tecnologia", "Administrativo", "Vendas", "Marketing",
  "Logística", "Indústria", "Saúde", "Construção",
  "Alimentação", "Serviços",
]);

const SUMMARY_ROW_REGEX =
  /(total de vagas|total geral|vagas abertas|feirão da empregabilidade|quantidade total)/i;

/* ────────────────────────── AI prompt ────────────────────────── */

const buildPrompt = (text: string) => `Você é um extrator de dados de vagas de emprego. Analise o texto abaixo extraído de um documento do SINE e extraia TODAS as vagas.

REGRAS CRÍTICAS:
1. Cada LINHA da tabela é uma vaga separada.
2. O campo "qtd" é SOMENTE o número que aparece na primeira coluna (coluna "Qtd"). NUNCA concatene com o CBO ou outro número.
   Exemplo correto: Qtd=2, CBO=20115 → qtd:2
   Exemplo ERRADO: qtd:220115
3. IGNORE linhas de cabeçalho, rodapé, totais ou resumos como "3312 Vagas abertas para o feirão".
4. Se a tabela NÃO tiver coluna "Qtd" explícita, assuma qtd=1 para cada linha.
5. Cada cargo repetido com descrição/requisitos diferentes é uma entrada SEPARADA.

Para cada vaga retorne:
- qtd: inteiro positivo (geralmente entre 1 e 100)
- cbo: código CBO (string) ou ""
- cargo: nome do cargo
- escolaridade: escolaridade exigida
- experiencia: experiência exigida
- descricao: observações da vaga
- categoria: "Tecnologia"|"Administrativo"|"Vendas"|"Marketing"|"Logística"|"Indústria"|"Saúde"|"Construção"|"Alimentação"|"Serviços"

Responda APENAS com JSON: {"vagas": [...]}

Texto:
${text}`;

/* ────────────────────────── AI call ────────────────────────── */

async function callAI(apiKey: string, text: string): Promise<any[]> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

  if (!res.ok) {
    const errText = await res.text();
    console.error("AI error:", errText);
    throw new Error("Erro IA: " + res.status);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("AI response not JSON:", content.substring(0, 500));
    throw new Error("Resposta da IA não é JSON");
  }

  return JSON.parse(jsonMatch[0]).vagas || [];
}

/* ────────────────────────── helpers ────────────────────────── */

function splitIntoChunks(text: string, maxChars: number): string[] {
  const lines = text.split("\n");
  const chunks: string[] = [];
  let chunk = "";

  for (const line of lines) {
    if (chunk.length + line.length + 1 > maxChars && chunk.length > 0) {
      chunks.push(chunk);
      chunk = "";
    }
    chunk += (chunk ? "\n" : "") + line;
  }
  if (chunk.trim()) chunks.push(chunk);
  return chunks;
}

function normalizeText(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim() : fallback;
}

/**
 * Sanitize qtd: must be an integer 1–9999.
 * Values above 9999 are almost certainly concatenation errors (CBO+Qtd).
 */
function safeQtd(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number.parseInt(String(v ?? "").replace(/\D/g, ""), 10);
  if (!Number.isInteger(n) || n <= 0 || n > 9999) return null;
  return n;
}

function normalizeVaga(raw: any) {
  const cargo = normalizeText(raw?.cargo);
  const qtd = safeQtd(raw?.qtd);

  if (!cargo || !qtd) return null;
  if (SUMMARY_ROW_REGEX.test(cargo)) return null;

  return {
    qtd,
    cbo: normalizeText(raw?.cbo).replace(/[^\d-]/g, ""),
    cargo,
    escolaridade: normalizeText(raw?.escolaridade, "Não informado"),
    experiencia: normalizeText(raw?.experiencia, "Não informada"),
    descricao: normalizeText(raw?.descricao),
    categoria: VALID_CATEGORIES.has(raw?.categoria) ? raw.categoria : "Serviços",
  };
}

/**
 * Try to extract the authoritative total from the document title/header or filename.
 * Patterns like "3312 Vagas abertas" or filename "3312_Vagas_abertas..."
 */
function extractDeclaredTotal(text: string, fileName: string): number | null {
  // Try from text content: "3312 Vagas abertas" or "3312 vagas"
  const textMatch = text.match(/(\d{3,5})\s*vagas?\b/i);
  if (textMatch) {
    const n = parseInt(textMatch[1], 10);
    if (n > 0 && n < 100000) return n;
  }

  // Try from filename: "3312_Vagas_abertas..."
  const fileMatch = fileName.match(/^(\d{3,5})[_\s-]*vagas?/i);
  if (fileMatch) {
    const n = parseInt(fileMatch[1], 10);
    if (n > 0 && n < 100000) return n;
  }

  return null;
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

    /* ── extract text ── */
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const chunks = splitIntoChunks(extractedText, MAX_CHUNK_CHARS);
    const totalChunks = chunks.length;
    console.log(
      `Texto: ${extractedText.length} chars, ${extractedText.split("\n").length} linhas, ${totalChunks} parte(s)`
    );

    /* ── SSE stream ── */
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (d: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(d)}\n\n`));
        };

        try {
          send({ type: "progress", step: "extract", message: "Texto extraído do arquivo", current: 0, total: totalChunks });

          let allRaw: any[] = [];
          const batchSize = 3;

          for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            const results = await Promise.all(
              batch.map((chunk, idx) => {
                console.log(`Parte ${i + idx + 1}/${totalChunks} (${chunk.length} chars)...`);
                return callAI(apiKey, chunk).catch((err) => {
                  console.error(`Erro parte ${i + idx + 1}:`, err.message);
                  return [] as any[];
                });
              })
            );
            for (const r of results) allRaw = allRaw.concat(r);

            const processed = Math.min(i + batchSize, totalChunks);
            send({ type: "progress", step: "ai", message: `Processando parte ${processed}/${totalChunks}`, current: processed, total: totalChunks });
          }

          /* ── normalize + filter ── */
          const vagas = allRaw
            .map(normalizeVaga)
            .filter((v): v is NonNullable<typeof v> => Boolean(v));

          const summedTotal = vagas.reduce((s, v) => s + v.qtd, 0);

          /* Use declared total from document title/filename if available */
          const declaredTotal = extractDeclaredTotal(extractedText, file.name);
          const totalVagas = declaredTotal ?? summedTotal;

          /* Log per-entry for debugging */
          const rejected = allRaw.length - vagas.length;
          console.log(
            `Resultado: ${allRaw.length} brutas, ${rejected} rejeitadas, ${vagas.length} válidas, soma=${summedTotal}, declarado=${declaredTotal ?? "N/A"}, totalFinal=${totalVagas}`
          );
          if (rejected > 0) {
            const examples = allRaw
              .filter((r) => !normalizeVaga(r))
              .slice(0, 5)
              .map((r) => `  cargo="${r?.cargo}" qtd=${r?.qtd}`);
            console.log("Exemplos rejeitados:\n" + examples.join("\n"));
          }

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
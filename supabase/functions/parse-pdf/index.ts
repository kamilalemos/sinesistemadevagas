import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CHUNK_SIZE = 12000;

const buildPrompt = (text: string) => `Você é um extrator de dados de vagas de emprego. Analise o texto abaixo extraído de um PDF do SINE (Sistema Nacional de Emprego) e extraia TODAS as vagas encontradas.

Para cada vaga, retorne um objeto JSON com:
- qtd: número de vagas (inteiro)
- cbo: código CBO se disponível (string, ex: "5173-30"), ou string vazia
- cargo: nome do cargo (string)
- escolaridade: nível de escolaridade exigido (string)
- experiencia: experiência exigida (string)
- descricao: descrição adicional da vaga (string)
- categoria: uma dessas categorias: "Tecnologia", "Administrativo", "Vendas", "Marketing", "Logística", "Indústria", "Saúde", "Construção", "Alimentação", "Serviços"

Responda APENAS com um JSON válido no formato: {"vagas": [...]}

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

    const chunks: string[] = [];
    for (let i = 0; i < extractedText.length; i += CHUNK_SIZE) {
      chunks.push(extractedText.substring(i, i + CHUNK_SIZE));
    }

    const totalChunks = chunks.length;
    console.log(`Texto total: ${extractedText.length} chars, dividido em ${totalChunks} parte(s)`);

    // Use SSE to stream progress
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          send({ type: "progress", step: "extract", message: "Texto extraído do PDF", current: 0, total: totalChunks });

          let allVagas: any[] = [];
          const batchSize = 3;

          for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            const results = await Promise.all(
              batch.map((chunk, idx) => {
                console.log(`Processando parte ${i + idx + 1}/${totalChunks}...`);
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

          // Deduplicate
          const vagaMap = new Map<string, any>();
          for (const v of allVagas) {
            const key = `${v.cargo}|${v.cbo || ""}`;
            if (vagaMap.has(key)) {
              vagaMap.get(key).qtd += v.qtd || 0;
            } else {
              vagaMap.set(key, { ...v });
            }
          }
          const vagas = Array.from(vagaMap.values());
          const totalVagas = vagas.reduce((sum: number, v: any) => sum + (v.qtd || 0), 0);

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

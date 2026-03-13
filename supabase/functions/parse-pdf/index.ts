import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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
      // Use pdf-parse for PDF files
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

    // Use AI to extract structured job data
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Você é um extrator de dados de vagas de emprego. Analise o texto abaixo extraído de um PDF do SINE (Sistema Nacional de Emprego) e extraia TODAS as vagas encontradas.

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
${extractedText.substring(0, 15000)}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", errText);
      return new Response(JSON.stringify({ error: "Erro ao processar com IA: " + aiResponse.status }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Extract JSON from response (may be wrapped in markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("AI response not JSON:", content.substring(0, 500));
      return new Response(JSON.stringify({ error: "Não foi possível interpretar a resposta da IA" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const vagas = parsed.vagas || [];
    const totalVagas = vagas.reduce((sum: number, v: any) => sum + (v.qtd || 0), 0);

    return new Response(JSON.stringify({
      success: true,
      vagas,
      totalVagas,
      rawTextPreview: extractedText.substring(0, 500),
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error("Parse error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

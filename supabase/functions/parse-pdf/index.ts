import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function detectarCategoria(cargo: string): string {
  const c = cargo.toLowerCase();
  if (c.includes("desenvolv") || c.includes("técnico") || c.includes("informát") || c.includes("ti") || c.includes("program") || c.includes("sistema")) return "Tecnologia";
  if (c.includes("admin") || c.includes("recep") || c.includes("secretár") || c.includes("escritur") || c.includes("auxiliar admin")) return "Administrativo";
  if (c.includes("vend") || c.includes("comerci") || c.includes("balcon") || c.includes("promotor") || c.includes("caixa")) return "Vendas";
  if (c.includes("market") || c.includes("design") || c.includes("comunic") || c.includes("publicit")) return "Marketing";
  if (c.includes("motor") || c.includes("logíst") || c.includes("logist") || c.includes("entrega") || c.includes("estoque") || c.includes("expedição")) return "Logística";
  if (c.includes("oper") || c.includes("produção") || c.includes("produçao") || c.includes("industr") || c.includes("soldad") || c.includes("tornei") || c.includes("mecân") || c.includes("eletr")) return "Indústria";
  return "Serviços";
}

interface VagaExtraida {
  qtd: number;
  cbo: string;
  cargo: string;
  escolaridade: string;
  experiencia: string;
  descricao: string;
  categoria: string;
}

function parseExtractedText(text: string): VagaExtraida[] {
  const vagas: VagaExtraida[] = [];
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Try pattern: number at start of line (Qtd field)
    // Common PDF table patterns:
    // "2 5173-30 VENDEDOR EM COMÉRCIO ATACADISTA Ensino Médio Completo 6 meses Vender mercadorias..."
    // "1;5173-30;VENDEDOR;Ensino Médio;6 meses;Descrição"

    // Pattern 1: Tab/semicolon separated
    const sepParts = line.split(/\t|;/).map(p => p.trim());
    if (sepParts.length >= 4) {
      const qtd = parseInt(sepParts[0]);
      if (!isNaN(qtd) && qtd > 0 && qtd < 1000) {
        const hasCBO = /^\d{4}/.test(sepParts[1]);
        const offset = hasCBO ? 1 : 0;
        const cargo = sepParts[1 + offset] || "Cargo não informado";
        vagas.push({
          qtd,
          cbo: hasCBO ? sepParts[1] : "",
          cargo,
          escolaridade: sepParts[2 + offset] || "Não informado",
          experiencia: sepParts[3 + offset] || "Não informada",
          descricao: sepParts[4 + offset] || "",
          categoria: detectarCategoria(cargo),
        });
        continue;
      }
    }

    // Pattern 2: Space-separated PDF text extraction
    // Match: starts with a small number (1-999), optionally followed by CBO code
    const spaceMatch = line.match(/^(\d{1,3})\s+(\d{4}[-‐]\d{2})?\s*(.+)/);
    if (spaceMatch) {
      const qtd = parseInt(spaceMatch[1]);
      if (qtd > 0 && qtd < 1000) {
        const cbo = spaceMatch[2] || "";
        const rest = spaceMatch[3].trim();
        
        // Try to split the rest into cargo, escolaridade, experiência, descrição
        // Common escolaridade keywords to split on
        const escolaridadePatterns = [
          /\s+(ensino\s+(?:fundamental|médio|superior)\s*(?:completo|incompleto)?)/i,
          /\s+(fundamental\s*(?:completo|incompleto)?)/i,
          /\s+(médio\s*(?:completo|incompleto)?)/i,
          /\s+(superior\s*(?:completo|incompleto)?)/i,
          /\s+(técnico\s*(?:completo|incompleto)?)/i,
          /\s+(não\s*exigid[ao])/i,
        ];

        let cargo = rest;
        let escolaridade = "Não informado";
        let experiencia = "Não informada";
        let descricao = "";

        for (const pattern of escolaridadePatterns) {
          const idx = rest.search(pattern);
          if (idx > 0) {
            cargo = rest.substring(0, idx).trim();
            const afterCargo = rest.substring(idx).trim();
            
            const escMatch = afterCargo.match(pattern);
            if (escMatch) {
              escolaridade = escMatch[1].trim();
              const afterEsc = afterCargo.substring(afterCargo.indexOf(escMatch[1]) + escMatch[1].length).trim();
              
              // Try to find experiência pattern
              const expMatch = afterEsc.match(/^(\d+\s*(?:mes(?:es)?|ano(?:s)?|mês|meses)|não\s*exigid[ao])/i);
              if (expMatch) {
                experiencia = expMatch[1].trim();
                descricao = afterEsc.substring(expMatch[0].length).trim();
              } else {
                descricao = afterEsc;
              }
            }
            break;
          }
        }

        // Clean up cargo name (remove trailing numbers/codes)
        cargo = cargo.replace(/\s+\d+$/, "").trim();

        if (cargo.length > 2) {
          vagas.push({
            qtd,
            cbo,
            cargo,
            escolaridade,
            experiencia,
            descricao,
            categoria: detectarCategoria(cargo),
          });
        }
      }
    }
  }

  return vagas;
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

    const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    let extractedText: string;

    if (isPDF) {
      // Use pdf-parse for PDF files
      const { default: pdfParse } = await import("npm:pdf-parse@1.1.1");
      const buffer = await file.arrayBuffer();
      const pdfData = await pdfParse(new Uint8Array(buffer));
      extractedText = pdfData.text;
    } else {
      // Plain text / CSV
      extractedText = await file.text();
    }

    const vagas = parseExtractedText(extractedText);
    const totalVagas = vagas.reduce((sum, v) => sum + v.qtd, 0);

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
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

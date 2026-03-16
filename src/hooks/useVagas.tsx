import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categorias } from "@/store/vagasStore";

export interface VagaDB {
  id: string;
  qtd: number;
  cbo: string | null;
  cargo: string;
  escolaridade: string;
  experiencia: string;
  descricao: string;
  categoria: string;
  tipo: string;
}

const fetchVagas = async (tipo: "semana" | "feirao"): Promise<VagaDB[]> => {
  const { data, error } = await supabase
    .from("vagas")
    .select("*")
    .eq("tipo", tipo);
  if (error) throw error;
  return data ?? [];
};

const fetchConfig = async (chave: string): Promise<string> => {
  const { data } = await supabase
    .from("configuracoes")
    .select("valor")
    .eq("chave", chave)
    .single();
  return data?.valor ?? "";
};

export const useVagasSemana = () => {
  return useQuery({
    queryKey: ["vagas", "semana"],
    queryFn: () => fetchVagas("semana"),
  });
};

export const useVagasFeirao = () => {
  return useQuery({
    queryKey: ["vagas", "feirao"],
    queryFn: () => fetchVagas("feirao"),
  });
};

export const useConfiguracoes = () => {
  return useQuery({
    queryKey: ["configuracoes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("configuracoes").select("*");
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach((c) => { map[c.chave] = c.valor; });
      return map;
    },
  });
};

export const calcTotalVagas = (vagas: VagaDB[], declaredTotal?: string) => {
  if (declaredTotal) {
    const n = parseInt(declaredTotal, 10);
    if (n > 0) return n;
  }
  return vagas.reduce((sum, v) => sum + v.qtd, 0);
};

export const calcCategoriasComQtd = (vagas: VagaDB[]) =>
  categorias.map((cat) => ({
    ...cat,
    quantidade: vagas
      .filter((v) => v.categoria === cat.nome)
      .reduce((sum, v) => sum + v.qtd, 0),
  }));

export { categorias };

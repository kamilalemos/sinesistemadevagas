import { useState, useMemo, useEffect } from "react";
import { Search, ArrowLeft, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useVagasLocalStore } from "@/store/vagasStorage";
import { VagaLocal } from "@/types";
import { VagaCard } from "@/components/vagas/VagaCard";

interface VagaAgrupada {
  cargo: string;
  totalQtd: number;
  cbos: string[];
  numVagas: string[];
  escolaridade: string[];
  experiencia: string[];
  descricoes: string[];
  categoria: string;
  salario: string[];
  beneficios: string[];
  periodos: string[];
}

function agruparVagas(vagas: VagaLocal[]): VagaAgrupada[] {
  const map = new Map<string, VagaAgrupada>();

  for (const v of vagas) {
    const key = v.descricao.trim().toLowerCase();
    const existing = map.get(key);

    if (existing) {
      existing.totalQtd += v.quantidade;
      if (v.codigo && !existing.numVagas.includes(v.codigo)) existing.numVagas.push(v.codigo);
      if (v.salario && !existing.salario.includes(v.salario)) existing.salario.push(v.salario);
      if (v.beneficios && !existing.beneficios.includes(v.beneficios)) existing.beneficios.push(v.beneficios);
      if (v.cbo && !existing.cbos.includes(v.cbo)) existing.cbos.push(v.cbo);
      if (v.escolaridade && !existing.escolaridade.includes(v.escolaridade)) existing.escolaridade.push(v.escolaridade);
      if (v.experiencia && !existing.experiencia.includes(v.experiencia)) existing.experiencia.push(v.experiencia);
      if (v.descricao && !existing.descricoes.includes(v.descricao)) existing.descricoes.push(v.descricao);
      if (v.periodo && !existing.periodos.includes(v.periodo)) existing.periodos.push(v.periodo);
    } else {
      map.set(key, {
        cargo: v.descricao,
        totalQtd: v.quantidade,
        cbos: v.cbo ? [v.cbo] : [],
        numVagas: v.codigo ? [v.codigo] : [],
        escolaridade: v.escolaridade ? [v.escolaridade] : [],
        experiencia: v.experiencia ? [v.experiencia] : [],
        descricoes: v.descricao ? [v.descricao] : [],
        categoria: v.categoria,
        salario: v.salario ? [v.salario] : [],
        beneficios: v.beneficios ? [v.beneficios] : [],
        periodos: v.periodo ? [v.periodo] : [],
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.cargo.localeCompare(b.cargo));
}

const Vagas = () => {
  const { vagas_semana, periodo_semana, refreshFromStorage } = useVagasLocalStore();
  
  useEffect(() => {
    refreshFromStorage();
  }, [refreshFromStorage]);

  const vagas = vagas_semana.filter(v => v.publicada);
  const [searchParams, setSearchParams] = useSearchParams();
  const [busca, setBusca] = useState("");

  const categoriaFiltro = searchParams.get("categoria") || "";

  const totalVagas = vagas.reduce((sum, v) => sum + v.quantidade, 0);
  const periodo = periodo_semana;

  const vagasFiltradas = vagas.filter((v) => {
    const termo = busca.toLowerCase();
    const matchBusca =
      !busca ||
      v.descricao.toLowerCase().includes(termo) ||
      v.categoria?.toLowerCase().includes(termo) ||
      v.cbo?.toLowerCase().includes(termo);
    const matchCategoria = !categoriaFiltro || v.categoria === categoriaFiltro;
    return matchBusca && matchCategoria;
  });

  const vagasAgrupadas = useMemo(() => agruparVagas(vagasFiltradas), [vagasFiltradas]);

  const limparFiltro = () => {
    setSearchParams({});
  };

  return (
    <div className="pt-14 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-primary"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="font-heading font-bold text-lg text-foreground">Vagas da Semana</h1>
        </div>

        <p className="text-muted-foreground text-xs">
          Período: {periodo} • {totalVagas} vagas
        </p>

        {categoriaFiltro && (
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
              {categoriaFiltro}
              <button onClick={limparFiltro} className="hover:bg-primary/20 rounded-full p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
            <span className="text-muted-foreground text-xs">{vagasAgrupadas.length} cargos</span>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por cargo..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9 rounded-xl bg-card border-border" />
        </div>

        <div className="space-y-5">
          {vagasAgrupadas.map((vaga, i) => (
            <VagaCard
              key={vaga.cargo}
              {...vaga}
              periodoGeral={periodo}
              index={i}
            />
          ))}
        </div>

        {vagasAgrupadas.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">
            {busca || categoriaFiltro ? "Nenhuma vaga encontrada para este filtro." : "Nenhuma vaga cadastrada ainda."}
          </p>
        )}
      </div>
    </div>
  );
};

export default Vagas;

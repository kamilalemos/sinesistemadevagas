import { useState, useMemo } from "react";
import { Search, ArrowLeft, X, Hash, Tag, Calendar, DollarSign, Gift, GraduationCap, Briefcase, FileText } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useVagasLocalStore, VagaLocal } from "@/store/vagasStorage";
import { motion } from "framer-motion";

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
  const { vagas_semana, periodo_semana } = useVagasLocalStore();
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
      <div className="container mx-auto px-4 py-6 space-y-4">
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

        <div className="space-y-3">
          {vagasAgrupadas.map((vaga, i) => (
            <motion.div
              key={vaga.cargo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-card rounded-xl p-4 md:p-5 shadow-sm border border-border hover:border-primary/40 transition-all group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-bold text-base md:text-lg text-foreground leading-tight">
                      {vaga.cargo}
                    </h3>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {vaga.categoria}
                    </span>
                  </div>
                  
                  {/* Linha compacta 1: CBO, ID, Período */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] md:text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3" /> CBO: {vaga.cbos.join(", ")}
                    </span>
                    <span className="hidden md:inline text-muted-foreground/30">•</span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" /> ID: {vaga.numVagas.join(", ")}
                    </span>
                    <span className="hidden md:inline text-muted-foreground/30">•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {vaga.periodos.length > 0 ? vaga.periodos.join(", ") : periodo}
                    </span>
                  </div>
                </div>

                <div className="bg-primary/5 group-hover:bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20 shrink-0 flex flex-col items-center justify-center min-w-[60px] transition-colors">
                  <span className="text-base md:text-lg font-bold leading-none">{vaga.totalQtd}</span>
                  <span className="text-[9px] uppercase font-bold opacity-80">{vaga.totalQtd > 1 ? "Vagas" : "Vaga"}</span>
                </div>
              </div>

              {/* Linha compacta 2: Salário, Escolaridade, Experiência */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                <CompactInfo icon={DollarSign} value={vaga.salario.join(", ") || "À combinar"} prefix="💰" />
                <CompactInfo icon={GraduationCap} value={vaga.escolaridade.join(", ")} prefix="🎓" />
                <CompactInfo icon={Briefcase} value={vaga.experiencia.join(", ")} prefix="💼" />
              </div>

              {/* Linha compacta 3: Benefícios */}
              <div className="flex items-center gap-1.5 text-[11px] md:text-xs text-foreground/80 bg-muted/30 p-2 rounded-lg border border-border/50">
                <span className="text-sm">🎁</span>
                <span className="font-medium line-clamp-1">{vaga.beneficios.join(", ") || "Sem benefícios informados"}</span>
              </div>

              {/* Descrição truncada */}
              {vaga.descricoes.length > 0 && (
                <p className="mt-2 text-[11px] md:text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
                  "{vaga.descricoes[0]}"
                </p>
              )}
            </motion.div>
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

const CompactInfo = ({ value, prefix }: { icon: any, value: string, prefix?: string }) => (
  <div className="flex items-center gap-1 text-[11px] md:text-xs font-semibold text-foreground/90">
    <span>{prefix}</span>
    <span>{value || "Não informado"}</span>
  </div>
);

export default Vagas;

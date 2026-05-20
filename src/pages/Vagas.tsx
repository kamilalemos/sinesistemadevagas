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

        <div className="space-y-4">
          {vagasAgrupadas.map((vaga, i) => (
            <motion.div
              key={vaga.cargo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-card rounded-2xl p-5 md:p-6 shadow-card border border-border hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-border/50">
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-lg md:text-xl text-foreground leading-tight">
                    {vaga.cargo}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-medium text-primary">
                    <span className="bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">{vaga.categoria}</span>
                  </div>
                </div>
                <div className="bg-primary text-primary-foreground text-xs md:text-sm font-bold px-4 py-2 rounded-xl shadow-lg shadow-primary/20 shrink-0 flex flex-col items-center justify-center min-w-[70px]">
                  <span className="text-lg md:text-xl leading-none">{vaga.totalQtd}</span>
                  <span className="text-[10px] md:text-[11px] uppercase opacity-90">{vaga.totalQtd > 1 ? "Vagas" : "Vaga"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                <InfoItem icon={Hash} label="CBO" value={vaga.cbos.join(", ")} />
                <InfoItem icon={Tag} label="ID da vaga" value={vaga.numVagas.join(", ")} />
                <InfoItem icon={Calendar} label="Período" value={vaga.periodos.length > 0 ? vaga.periodos.join(", ") : periodo} />
                <InfoItem icon={DollarSign} label="Salário" value={vaga.salario.join(", ") || "A combinar"} />
                <InfoItem icon={Gift} label="Benefícios" value={vaga.beneficios.join(", ") || "Não informado"} />
                <InfoItem icon={GraduationCap} label="Escolaridade" value={vaga.escolaridade.join(", ")} />
                <InfoItem icon={Briefcase} label="Experiência" value={vaga.experiencia.join(", ")} />
                <div className="md:col-span-2">
                  <InfoItem icon={FileText} label="Descrição" value={vaga.descricoes.join(", ")} />
                </div>
              </div>
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

const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-start gap-2.5 group">
    <div className="mt-0.5 p-1.5 rounded-lg bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
      <Icon className="w-3.5 h-3.5" />
    </div>
    <div className="space-y-0.5">
      <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
      <p className="text-sm md:text-base text-foreground font-medium leading-tight">{value || "Não informado"}</p>
    </div>
  </div>
);

export default Vagas;

import { useState, useEffect, useMemo } from "react";
import { Search, ArrowLeft, Rocket, Calendar, Clock, MapPin, X, Hash, Tag, DollarSign, Gift, GraduationCap, Briefcase, FileText } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useVagasFeirao } from "@/hooks/useVagas";
import AnimatedCounter from "@/components/AnimatedCounter";
import { motion } from "framer-motion";
import { Pagination } from "@/components/ui/pagination-custom";

const Feirao = () => {
  const { data: vagas = [], isLoading, ativo: feiraoAtivo, periodo } = useVagasFeirao();
  const [searchParams, setSearchParams] = useSearchParams();
  const [busca, setBusca] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const categoriaFiltro = searchParams.get("categoria") || "";
  const totalVagas = vagas.reduce((sum, v) => sum + v.quantidade, 0);

  const termos = busca.toLowerCase().split(/\s+/).filter(Boolean);
  const vagasFiltradas = vagas.filter((v) => {
    const haystack = [v.descricao, v.categoria, v.cbo, v.codigo]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchBusca = termos.every((t) => haystack.includes(t));
    const matchCategoria = !categoriaFiltro || v.categoria === categoriaFiltro;
    return matchBusca && matchCategoria;
  });

  const totalPages = Math.ceil(vagasFiltradas.length / itemsPerPage);

  const currentVagas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return vagasFiltradas.slice(startIndex, startIndex + itemsPerPage);
  }, [vagasFiltradas, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [busca, categoriaFiltro]);

  const limparFiltro = () => {
    setSearchParams({});
  };

  if (isLoading) {
    return (
      <div className="pt-14 min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!feiraoAtivo) {
    return (
      <div className="pt-14 min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-2xl shadow-card p-8 max-w-md w-full border border-border text-center space-y-4">
          <Rocket className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="font-heading font-bold text-xl text-foreground">Feirão da Empregabilidade</h1>
          <p className="text-muted-foreground text-sm">
            O Feirão da Empregabilidade não está ativo no momento. Fique atento, em breve teremos um novo evento!
          </p>
          <Link to="/" className="inline-block text-primary text-sm font-medium hover:underline">
            ← Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-14 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-primary"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="font-heading font-bold text-lg text-foreground">Feirão da Empregabilidade</h1>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6 text-center border border-border">
          <Rocket className="w-8 h-8 text-secondary mx-auto mb-2" />
          <div className="text-4xl font-heading font-extrabold text-secondary">
            <AnimatedCounter target={totalVagas} />
          </div>
          <p className="text-muted-foreground text-sm">vagas disponíveis no feirão</p>

          <div className="mt-4 text-left space-y-2 text-sm text-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary shrink-0" />
              <span><strong>18 e 19 de março</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-secondary shrink-0" />
              <span>Das 9h às 16h</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-secondary shrink-0" />
              <span>Espaço Cultural José Lins do Rego</span>
            </div>
          </div>
        </div>

        {categoriaFiltro && (
          <div className="flex items-center gap-2">
            <span className="bg-secondary/10 text-secondary text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
              {categoriaFiltro}
              <button onClick={limparFiltro} className="hover:bg-secondary/20 rounded-full p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
            <span className="text-muted-foreground text-xs">{vagasFiltradas.length} cargos</span>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar vagas do feirão..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9 rounded-xl bg-card border-border" />
        </div>

        <div className="space-y-4">
          {currentVagas.map((vaga, i) => (
            <motion.div 
              key={vaga.id} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }} 
              className="bg-card rounded-2xl p-5 md:p-6 shadow-card border border-border hover:border-secondary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-border/50">
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-lg md:text-xl text-foreground leading-tight">
                    {vaga.descricao}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-medium text-secondary">
                    <span className="bg-secondary/10 px-2 py-0.5 rounded uppercase tracking-wider">{vaga.categoria}</span>
                  </div>
                </div>
                <div className="bg-secondary text-secondary-foreground text-xs md:text-sm font-bold px-4 py-2 rounded-xl shadow-lg shadow-secondary/20 shrink-0 flex flex-col items-center justify-center min-w-[70px]">
                  <span className="text-lg md:text-xl leading-none">{vaga.quantidade}</span>
                  <span className="text-[10px] md:text-[11px] uppercase opacity-90">{vaga.quantidade > 1 ? "Vagas" : "Vaga"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                <InfoItem icon={Hash} label="CBO" value={vaga.cbo} />
                <InfoItem icon={Tag} label="Nº da(s) vaga(s)" value={vaga.codigo} />
                <InfoItem icon={Calendar} label="Período" value={periodo} />
                <InfoItem icon={DollarSign} label="Salário" value={vaga.salario || "A combinar"} />
                <InfoItem icon={Gift} label="Benefícios" value={vaga.beneficios || "Não informado"} />
                <InfoItem icon={GraduationCap} label="Escolaridade" value={vaga.escolaridade} />
                <InfoItem icon={Briefcase} label="Experiência" value={vaga.experiencia} />
                <div className="md:col-span-2">
                  <InfoItem icon={FileText} label="Descrição" value={vaga.descricao} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />

        {vagasFiltradas.length === 0 && (
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
    <div className="mt-0.5 p-1.5 rounded-lg bg-muted/50 text-muted-foreground group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
      <Icon className="w-3.5 h-3.5" />
    </div>
    <div className="space-y-0.5">
      <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
      <p className="text-sm md:text-base text-foreground font-medium leading-tight">{value || "Não informado"}</p>
    </div>
  </div>
);

export default Feirao;

import { useState } from "react";
import { Search, ArrowLeft, Rocket, Calendar, Clock, MapPin, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useVagasFeirao, useConfiguracoes, calcTotalVagas } from "@/hooks/useVagas";
import AnimatedCounter from "@/components/AnimatedCounter";
import { motion } from "framer-motion";

const Feirao = () => {
  const { data: vagas = [] } = useVagasFeirao();
  const { data: config } = useConfiguracoes();
  const [searchParams, setSearchParams] = useSearchParams();
  const [busca, setBusca] = useState("");

  const feiraoAtivo = config?.feirao_ativo !== "false";
  const categoriaFiltro = searchParams.get("categoria") || "";
  const totalVagas = calcTotalVagas(vagas, config?.feirao_total_vagas);

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

  const vagasFiltradas = vagas.filter((v) => {
    const matchBusca =
      !busca ||
      v.cargo.toLowerCase().includes(busca.toLowerCase()) ||
      v.descricao.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = !categoriaFiltro || v.categoria === categoriaFiltro;
    return matchBusca && matchCategoria;
  });

  const limparFiltro = () => {
    setSearchParams({});
  };

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

        <div className="space-y-3">
          {vagasFiltradas.map((vaga, i) => (
            <motion.div key={vaga.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl p-4 shadow-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-bold text-sm text-foreground">{vaga.cargo}</span>
                <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">{vaga.qtd} vagas</span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><strong className="text-foreground">Escolaridade:</strong> {vaga.escolaridade}</p>
                <p><strong className="text-foreground">Experiência:</strong> {vaga.experiencia}</p>
                <p><strong className="text-foreground">Descrição:</strong> {vaga.descricao}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {vagasFiltradas.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">
            {busca || categoriaFiltro ? "Nenhuma vaga encontrada para este filtro." : "Nenhuma vaga cadastrada ainda."}
          </p>
        )}
      </div>
    </div>
  );
};

export default Feirao;

import { useState } from "react";
import { Search, ArrowLeft, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVagasSemana, useConfiguracoes, calcTotalVagas } from "@/hooks/useVagas";
import { motion } from "framer-motion";

const Vagas = () => {
  const { data: vagas = [] } = useVagasSemana();
  const { data: config } = useConfiguracoes();
  const [searchParams, setSearchParams] = useSearchParams();
  const [busca, setBusca] = useState("");

  const categoriaFiltro = searchParams.get("categoria") || "";

  const totalVagas = calcTotalVagas(vagas);
  const periodoInicio = config?.periodo_inicio ?? "";
  const periodoFim = config?.periodo_fim ?? "";

  const vagasFiltradas = vagas.filter((v) => {
    const matchBusca =
      !busca ||
      v.cargo.toLowerCase().includes(busca.toLowerCase()) ||
      v.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      v.categoria?.toLowerCase().includes(busca.toLowerCase());
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
          <h1 className="font-heading font-bold text-lg text-foreground">Vagas da Semana</h1>
        </div>

        <p className="text-muted-foreground text-xs">
          Período: {periodoInicio} a {periodoFim} • {totalVagas} vagas
        </p>

        {categoriaFiltro && (
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
              {categoriaFiltro}
              <button onClick={limparFiltro} className="hover:bg-primary/20 rounded-full p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
            <span className="text-muted-foreground text-xs">{vagasFiltradas.length} cargos</span>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar vagas..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9 rounded-xl bg-card border-border" />
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
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

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full bg-card rounded-xl shadow-card border border-border overflow-hidden">
            <thead>
              <tr className="bg-accent text-accent-foreground text-xs font-heading">
                <th className="px-4 py-3 text-left">Qtd</th>
                <th className="px-4 py-3 text-left">Cargo</th>
                <th className="px-4 py-3 text-left">Escolaridade</th>
                <th className="px-4 py-3 text-left">Experiência</th>
                <th className="px-4 py-3 text-left">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {vagasFiltradas.map((vaga) => (
                <tr key={vaga.id} className="border-t border-border text-sm hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-secondary">{vaga.qtd}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{vaga.cargo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{vaga.escolaridade}</td>
                  <td className="px-4 py-3 text-muted-foreground">{vaga.experiencia}</td>
                  <td className="px-4 py-3 text-muted-foreground">{vaga.descricao}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default Vagas;

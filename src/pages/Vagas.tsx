import { useState, useMemo } from "react";
import { Search, ArrowLeft, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useConfiguracoes } from "@/hooks/useVagas";
import { useVagasLocalStore, VagaLocal } from "@/store/vagasStorage";
import { motion } from "framer-motion";

interface VagaAgrupada {
  cargo: string;
  totalQtd: number;
  empresas: string[];
  numVagas: string[];
  escolaridade: string;
  experiencia: string;
  descricao: string;
  categoria: string;
  salario: string[];
  beneficios: string[];
}

function agruparVagas(vagas: VagaLocal[]): VagaAgrupada[] {
  const map = new Map<string, VagaAgrupada>();

  for (const v of vagas) {
    const key = v.descricao.trim().toLowerCase();
    const existing = map.get(key);

    if (existing) {
      existing.totalQtd += v.quantidade;
      if (v.codigo && !existing.numVagas.includes(v.codigo)) {
        existing.numVagas.push(v.codigo);
      }
      if (v.salario && !existing.salario.includes(v.salario)) {
        existing.salario.push(v.salario);
      }
      if (v.beneficios && !existing.beneficios.includes(v.beneficios)) {
        existing.beneficios.push(v.beneficios);
      }
    } else {
      map.set(key, {
        cargo: v.descricao,
        totalQtd: v.quantidade,
        empresas: [], // Oculto por regra
        numVagas: v.codigo ? [v.codigo] : [],
        escolaridade: v.escolaridade,
        experiencia: v.experiencia,
        descricao: v.descricao,
        categoria: v.categoria,
        salario: v.salario ? [v.salario] : [],
        beneficios: v.beneficios ? [v.beneficios] : [],
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
              className="bg-card rounded-xl p-4 md:p-5 shadow-card border border-border"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-heading font-bold text-sm md:text-base text-foreground">
                  {vaga.cargo}
                </h3>
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                  {vaga.totalQtd} vaga{vaga.totalQtd > 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-1.5 text-xs md:text-sm text-muted-foreground">
                {vaga.numVagas.length > 0 && (
                  <p>
                    <strong className="text-foreground">Nº da(s) vaga(s):</strong>{" "}
                    {vaga.numVagas.join(", ")}
                  </p>
                )}
                {vaga.salario.length > 0 && (
                  <p>
                    <strong className="text-foreground">Salário:</strong>{" "}
                    {vaga.salario.join(", ")}
                  </p>
                )}
                {vaga.beneficios.length > 0 && (
                  <p>
                    <strong className="text-foreground">Benefícios:</strong>{" "}
                    {vaga.beneficios.join(", ")}
                  </p>
                )}
                <p>
                  <strong className="text-foreground">Escolaridade:</strong>{" "}
                  {vaga.escolaridade}
                </p>
                <p>
                  <strong className="text-foreground">Experiência:</strong>{" "}
                  {vaga.experiencia}
                </p>
                {vaga.descricao && (
                  <p>
                    <strong className="text-foreground">Descrição:</strong>{" "}
                    {vaga.descricao}
                  </p>
                )}
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

export default Vagas;

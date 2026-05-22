import { motion } from "framer-motion";
import { Hash, Tag, Calendar, DollarSign, GraduationCap, Briefcase } from "lucide-react";

interface VagaCardProps {
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
  periodoGeral: string;
  index: number;
}

const CompactInfo = ({ value, prefix }: { value: string; prefix?: string }) => (
  <div className="flex items-center gap-1 text-[11px] md:text-xs font-semibold text-foreground/90">
    <span>{prefix}</span>
    <span>{value || "Não informado"}</span>
  </div>
);

export const VagaCard = ({
  cargo,
  totalQtd,
  cbos,
  numVagas,
  escolaridade,
  experiencia,
  descricoes,
  categoria,
  salario,
  beneficios,
  periodos,
  periodoGeral,
  index
}: VagaCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="bg-card rounded-xl p-4 md:p-5 shadow-sm border border-border hover:border-primary/40 transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-heading font-bold text-base md:text-lg text-foreground leading-tight">
              {cargo}
            </h3>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              {categoria}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] md:text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" /> CBO: {cbos.join(", ")}
            </span>
            <span className="hidden md:inline text-muted-foreground/30">•</span>
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" /> ID: {numVagas.join(", ")}
            </span>
            <span className="hidden md:inline text-muted-foreground/30">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {periodos.length > 0 ? periodos.join(", ") : periodoGeral}
            </span>
          </div>
        </div>

        <div className="bg-primary/5 group-hover:bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20 shrink-0 flex flex-col items-center justify-center min-w-[60px] transition-colors">
          <span className="text-base md:text-lg font-bold leading-none">{totalQtd}</span>
          <span className="text-[9px] uppercase font-bold opacity-80">{totalQtd > 1 ? "Vagas" : "Vaga"}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
        <CompactInfo value={salario.join(", ") || "À combinar"} prefix="💰" />
        <CompactInfo value={escolaridade.join(", ")} prefix="🎓" />
        <CompactInfo value={experiencia.join(", ")} prefix="💼" />
      </div>

      <div className="flex items-center gap-1.5 text-[11px] md:text-xs text-foreground/80 bg-muted/30 p-2 rounded-lg border border-border/50">
        <span className="text-sm">🎁</span>
        <span className="font-medium line-clamp-1">{beneficios.join(", ") || "Sem benefícios informados"}</span>
      </div>

      {descricoes.length > 0 && (
        <p className="mt-2 text-[11px] md:text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
          "{descricoes[0]}"
        </p>
      )}
    </motion.div>
  );
};

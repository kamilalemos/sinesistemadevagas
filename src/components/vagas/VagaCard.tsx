import { motion } from "framer-motion";
import { Hash, Tag, Calendar, DollarSign, GraduationCap, Briefcase, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

const CompactInfo = ({ value, prefix, icon: Icon }: { value: string; prefix?: string; icon: any }) => (
  <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-muted-foreground/80 bg-muted/40 px-3 py-1.5 rounded-full border border-border/40 transition-colors hover:bg-muted/60">
    <Icon className="w-3.5 h-3.5 text-primary/70" />
    <span className="truncate max-w-[140px]">{value || "Não informado"}</span>
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, type: "spring", damping: 20, stiffness: 100 }}
      className="bg-card rounded-[1.5rem] p-6 md:p-8 shadow-card hover:shadow-card-hover border border-border/50 hover:border-primary/20 transition-all group relative overflow-hidden"
    >
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md">
                {categoria}
              </Badge>
              {index < 5 && (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md border-none">
                  Nova
                </Badge>
              )}
            </div>
            <h3 className="font-heading font-extrabold text-lg md:text-xl text-foreground leading-tight group-hover:text-primary transition-colors">
              {cargo}
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <CompactInfo icon={DollarSign} value={salario.join(", ") || "À combinar"} />
            <CompactInfo icon={GraduationCap} value={escolaridade.join(", ")} />
            <CompactInfo icon={Briefcase} value={experiencia.join(", ")} />
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground/60 font-semibold italic">
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" /> CBO {cbos.join(", ")}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" /> ID {numVagas.join(", ")}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {periodos.length > 0 ? periodos.join(", ") : periodoGeral}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="bg-primary/5 group-hover:bg-primary group-hover:text-white text-primary px-4 py-3 rounded-2xl border border-primary/10 shrink-0 flex flex-col items-center justify-center min-w-[80px] transition-all duration-300 shadow-sm">
            <span className="text-2xl md:text-3xl font-black leading-none">{totalQtd}</span>
            <span className="text-[10px] uppercase font-black opacity-80 tracking-tighter">{totalQtd > 1 ? "Vagas" : "Vaga"}</span>
          </div>
          
          <div className="hidden md:flex w-10 h-10 rounded-full bg-muted items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {beneficios.length > 0 && (
        <div className="mt-6 pt-5 border-t border-dashed border-border/80 flex items-center gap-3">
          <div className="bg-amber-100 text-amber-700 p-1 rounded-md">
            <span className="text-xs">🎁</span>
          </div>
          <span className="text-[11px] md:text-xs font-bold text-foreground/70 line-clamp-1">
            {beneficios.join(", ")}
          </span>
        </div>
      )}
    </motion.div>
  );
};

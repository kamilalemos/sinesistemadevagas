import { motion } from "framer-motion";
import { Hash, Tag, Calendar, DollarSign, GraduationCap, Briefcase, ChevronRight, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

const CompactInfo = ({ value, icon: Icon, className }: { value: string; icon: any; className?: string }) => (
  <div className={cn("flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-muted-foreground/80", className)}>
    <Icon className="w-3.5 h-3.5 text-primary/60 shrink-0" />
    <span className="truncate max-w-[200px]">{value || "Não informado"}</span>
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
      className="bg-card rounded-2xl p-4 md:p-5 shadow-card hover:shadow-card-hover border border-border/50 hover:border-primary/20 transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-heading font-black text-base md:text-lg text-foreground leading-none group-hover:text-primary transition-colors truncate">
              {cargo}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md">
                {categoria}
              </Badge>
              {index < 3 && (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md border-none">
                  Nova
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground/50 font-bold uppercase tracking-tighter">
              <span className="flex items-center gap-1">CBO {cbos.join(", ")}</span>
              <span className="flex items-center gap-1">ID {numVagas.join(", ")}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 font-bold uppercase tracking-tighter">
              <Calendar className="w-3 h-3" />
              <span>{periodos.length > 0 ? periodos.join(", ") : periodoGeral}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
            <CompactInfo icon={DollarSign} value={salario.join(", ") || "À combinar"} className="text-foreground/80" />
            <CompactInfo icon={GraduationCap} value={escolaridade.join(", ")} />
            <CompactInfo icon={Briefcase} value={experiencia.join(", ")} />
            {beneficios.length > 0 && (
              <CompactInfo icon={Gift} value={beneficios.join(", ")} className="hidden md:flex" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="bg-primary/5 group-hover:bg-primary group-hover:text-white text-primary px-3 py-2 rounded-xl border border-primary/10 shrink-0 flex flex-col items-center justify-center min-w-[65px] transition-all duration-300">
            <span className="text-xl md:text-2xl font-black leading-none">{totalQtd}</span>
            <span className="text-[9px] uppercase font-black opacity-80 tracking-tighter">{totalQtd > 1 ? "Vagas" : "Vaga"}</span>
          </div>
          
          <div className="hidden lg:flex w-8 h-8 rounded-full bg-muted items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  periodoInicio: string;
  periodoFim: string;
  setPeriodoInicio: (v: string) => void;
  setPeriodoFim: (v: string) => void;
  onUpdate: () => void;
}

export function SectionPeriodo({ periodoInicio, periodoFim, setPeriodoInicio, setPeriodoFim, onUpdate }: Props) {
  return (
    <div id="section-periodo" className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-secondary" />
        <h2 className="font-heading font-semibold text-sm text-foreground">Período das Vagas</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Início</label>
          <Input value={periodoInicio} onChange={(e) => setPeriodoInicio(e.target.value)} placeholder="dd/mm/aaaa" className="rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Fim</label>
          <Input value={periodoFim} onChange={(e) => setPeriodoFim(e.target.value)} placeholder="dd/mm/aaaa" className="rounded-lg text-sm" />
        </div>
      </div>
      <Button size="sm" onClick={onUpdate} className="rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 font-heading text-xs">
        Atualizar período
      </Button>
    </div>
  );
}

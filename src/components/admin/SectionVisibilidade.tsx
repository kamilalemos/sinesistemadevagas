import { Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Props {
  semanaAtiva: boolean;
  feiraoAtivo: boolean;
  onToggle: (chave: string, valor: boolean) => void;
}

export function SectionVisibilidade({ semanaAtiva, feiraoAtivo, onToggle }: Props) {
  return (
    <div id="section-visibilidade" className="bg-card rounded-xl shadow-card p-5 border border-border space-y-4">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-secondary" />
        <h2 className="font-heading font-semibold text-sm text-foreground">Visibilidade das Seções</h2>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {semanaAtiva ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
          <span className="text-sm text-foreground">Vagas da Semana</span>
        </div>
        <Switch checked={semanaAtiva} onCheckedChange={(v) => onToggle("semana_ativa", v)} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {feiraoAtivo ? <Eye className="w-4 h-4 text-secondary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
          <span className="text-sm text-foreground">Feirão da Empregabilidade</span>
        </div>
        <Switch checked={feiraoAtivo} onCheckedChange={(v) => onToggle("feirao_ativo", v)} />
      </div>
    </div>
  );
}

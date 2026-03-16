import { Upload, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Props {
  tipo: "semana" | "feirao";
  label: string;
  totalVagas: number;
  totalCargos: number;
  uploadLoading: "semana" | "feirao" | null;
  progressInfo: { current: number; total: number; message: string } | null;
  onUpload: (tipo: "semana" | "feirao") => void;
  variant?: "primary" | "secondary";
}

export function SectionUpload({ tipo, label, totalVagas, totalCargos, uploadLoading, progressInfo, onUpload, variant = "primary" }: Props) {
  const isLoading = uploadLoading === tipo;
  const showProgress = uploadLoading && progressInfo;
  const btnClass = variant === "secondary"
    ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
    : "bg-primary text-primary-foreground hover:bg-primary/90";

  return (
    <div id={`section-upload-${tipo}`} className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
      <h2 className="font-heading font-semibold text-sm text-foreground">{label}</h2>
      <p className="text-xs text-muted-foreground">
        Atual: {totalVagas} vagas • {totalCargos} cargos
      </p>

      {isLoading && showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-heading font-semibold text-foreground flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              {progressInfo.message}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {progressInfo.total > 1 ? `${progressInfo.current}/${progressInfo.total}` : ""}
            </span>
          </div>
          <Progress value={progressInfo.total > 0 ? (progressInfo.current / progressInfo.total) * 100 : 0} className="h-2" />
        </div>
      )}

      <Button onClick={() => onUpload(tipo)} disabled={!!uploadLoading} className={`w-full rounded-xl font-heading font-semibold gap-2 ${btnClass}`}>
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {isLoading ? "Processando PDF..." : "Upload arquivo de vagas"}
      </Button>
      {tipo === "semana" && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <FileText className="w-3 h-3" />
          Formatos: PDF, CSV ou TXT — extração automática de tabelas
        </p>
      )}
    </div>
  );
}

import { Briefcase, TrendingUp, Users, Download, CalendarRange } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVagasLocalStore } from "@/store/vagasStorage";
import { useUltimoBackup } from "@/hooks/useVagas";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { PWAInstallGuideCard } from "./PWAInstallGuideCard";
import { formatDateBR, diasRestantes } from "@/lib/periodoNome";

export const DashboardPage = () => {
  const {
    vagas_semana, vagas_feirao,
    data_inicio_semana, data_fim_semana, periodo_semana,
    data_inicio_feirao, data_fim_feirao, periodo_feirao,
  } = useVagasLocalStore();
  const ultimoBackup = useUltimoBackup();

  const totalVagas = vagas_semana.reduce((acc, v) => acc + v.quantidade, 0) +
                     vagas_feirao.reduce((acc, v) => acc + v.quantidade, 0);

  const baixarBackup = () => {
    const raw = localStorage.getItem(STORAGE_KEYS.VAGAS_BACKUP);
    if (!raw) return;
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-vagas-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { title: "Total de Vagas", value: totalVagas, icon: Briefcase, color: "text-blue-500" },
    { title: "Vagas da Semana", value: vagas_semana.length, icon: TrendingUp, color: "text-green-500" },
    { title: "Vagas no Feirão", value: vagas_feirao.length, icon: Users, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-2xl">Dashboard Administrativo</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="rounded-xl shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">Atualizado agora mesmo</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <PeriodoAtualCard
        titulo="Vagas da Semana"
        inicio={data_inicio_semana}
        fim={data_fim_semana}
        label={periodo_semana}
      />
      <PeriodoAtualCard
        titulo="Feirão da Empregabilidade"
        inicio={data_inicio_feirao}
        fim={data_fim_feirao}
        label={periodo_feirao}
      />

      <PWAInstallGuideCard />



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <CardTitle>Bem-vindo, Administrador</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Este é o seu painel de controle. Aqui você pode gerenciar todas as vagas disponíveis no SINE João Pessoa de forma local e rápida.
              As alterações feitas aqui são refletidas imediatamente na área pública do site.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Backup automático</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Último backup:{" "}
              {ultimoBackup
                ? new Date(ultimoBackup).toLocaleString("pt-BR")
                : "nenhum ainda"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={baixarBackup}
            disabled={!ultimoBackup}
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar JSON
          </Button>
        </CardHeader>
      </Card>
    </div>
  );
};

function PeriodoAtualCard({
  titulo, inicio, fim, label,
}: { titulo: string; inicio: string | null; fim: string | null; label: string }) {
  const dias = diasRestantes(fim);
  const inicioBR = formatDateBR(inicio);
  const fimBR = formatDateBR(fim);
  const semDatas = !inicio || !fim;

  let restanteTexto = "—";
  let restanteTom: "ok" | "warn" | "expired" = "ok";
  if (dias !== null) {
    if (dias < 0) {
      restanteTexto = `Expirado há ${Math.abs(dias)} ${Math.abs(dias) === 1 ? "dia" : "dias"}`;
      restanteTom = "expired";
    } else if (dias === 0) {
      restanteTexto = "Último dia";
      restanteTom = "warn";
    } else {
      restanteTexto = `${dias} ${dias === 1 ? "dia" : "dias"}`;
      restanteTom = dias <= 3 ? "warn" : "ok";
    }
  }

  return (
    <Card className="rounded-xl shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <CalendarRange className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Período Atual — {titulo}</CardTitle>
            {label && <p className="text-xs text-muted-foreground mt-0.5">{label}</p>}
          </div>
        </div>
        <Badge
          className={
            restanteTom === "expired"
              ? "bg-destructive/10 text-destructive border-transparent"
              : restanteTom === "warn"
              ? "bg-amber-500/10 text-amber-600 border-transparent"
              : "bg-emerald-500/10 text-emerald-600 border-transparent"
          }
        >
          Restam: {restanteTexto}
        </Badge>
      </CardHeader>
      <CardContent>
        {semDatas ? (
          <p className="text-sm text-muted-foreground">
            Nenhum intervalo definido. Configure as datas em Cadastro de Vagas.
          </p>
        ) : (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data Inicial</span>
              <span className="font-heading font-black text-lg text-foreground tabular-nums">{inicioBR}</span>
            </div>
            <div className="text-muted-foreground text-xl">→</div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data Final</span>
              <span className="font-heading font-black text-lg text-foreground tabular-nums">{fimBR}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

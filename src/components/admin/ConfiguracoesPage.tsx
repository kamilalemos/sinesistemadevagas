import { KeyRound, Shield, Download, FileJson, FileSpreadsheet, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useVagasLocalStore } from "@/store/vagasStorage";
import { getHistory } from "@/lib/vagasPersistence";
import { exportToCSV, exportToJSON } from "@/lib/exportUtils";
import { VagaLocal } from "@/types";
import { logAudit } from "@/services/auditService";
import { ChangePasswordCard } from "./ChangePasswordCard";
import { resetPWAGuide } from "./PWAInstallGuideCard";

export const ConfiguracoesPage = () => {
  const { vagas_semana, vagas_feirao } = useVagasLocalStore();

  const getConsolidatedMonthData = () => {
    const history = getHistory();
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    const consolidatedVagas: VagaLocal[] = [];

    vagas_semana.filter(v => v.publicada).forEach(v => {
      consolidatedVagas.push({ ...v, periodo: "Semana Atual" });
    });

    vagas_feirao.filter(v => v.publicada).forEach(v => {
      consolidatedVagas.push({ ...v, periodo: "Feirão da Empregabilidade" });
    });

    const currentHistory = history.find(h => h.year === year && String(h.month).padStart(2, '0') === month);
    if (currentHistory) {
      Object.entries(currentHistory.weeks).forEach(([key, weekData]: [string, any]) => {
        const weekNum = key.split('_')[1];
        if (weekNum !== '3') {
          weekData.vagas.filter((v: any) => v.publicada).forEach((v: any) => {
            consolidatedVagas.push({ ...v, periodo: weekData.periodo || `Semana ${weekNum}` });
          });
        }
      });
    }

    return {
      vagas: consolidatedVagas,
      month: now.getMonth() + 1,
      year: year,
      monthName: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][now.getMonth()]
    };
  };

  const handleExportFullBackup = () => {
    const data = getConsolidatedMonthData();
    if (data.vagas.length === 0) {
      toast.error("Nenhum dado publicado este mês para backup.");
      return;
    }

    const backupData = {
      mes: `${data.year}-${String(data.month).padStart(2, '0')}`,
      vagas: data.vagas,
      exportadoEm: new Date().toISOString()
    };

    exportToJSON(backupData, `backup_mensal_${data.monthName.toLowerCase()}_${data.year}`);
    logAudit('export', 'periodo', 'full_backup', { format: 'JSON' });
  };

  const handleExportCSV = () => {
    const data = getConsolidatedMonthData();
    if (data.vagas.length === 0) {
      toast.error("Nenhuma vaga publicada este mês para exportar.");
      return;
    }

    exportToCSV(data.vagas, `relatorio_mensal_${data.monthName.toLowerCase()}_${data.year}`);
    logAudit('export', 'periodo', 'monthly_report', { format: 'CSV' });
  };


  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm shadow-primary/5">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="font-heading font-black text-3xl text-foreground tracking-tight">Configurações & Backup</h1>
          </div>
          <p className="text-muted-foreground font-medium pl-1">Gerencie os seus dados localmente.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <ChangePasswordCard />

        <Card className="rounded-[2rem] border-border/60 shadow-card overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Download className="w-5 h-5" />
              </div>
              <CardTitle className="font-heading font-black text-xl tracking-tight">Exportar Dados</CardTitle>
            </div>
            <CardDescription className="font-medium text-muted-foreground">Exporte suas vagas e históricos para relatórios ou backup.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-3 rounded-2xl border-border/60 hover:border-primary/50 hover:bg-primary/[0.02] transition-all group"
                onClick={handleExportCSV}
              >
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100 transition-colors">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="block font-black text-foreground">Planilha CSV</span>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-3 rounded-2xl border-border/60 hover:border-primary/50 hover:bg-primary/[0.02] transition-all group"
                onClick={handleExportFullBackup}
              >
                <div className="p-3 rounded-xl bg-amber-50 text-amber-500 group-hover:bg-amber-100 transition-colors">
                  <FileJson className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="block font-black text-foreground">Backup Completo JSON</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>



        <Card className="rounded-[2rem] border-border/60 shadow-card overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <KeyRound className="w-5 h-5" />
              </div>
              <CardTitle className="font-heading font-black text-xl tracking-tight">Segurança</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <p className="text-sm text-muted-foreground">O acesso ao painel é controlado localmente.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
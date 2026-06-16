import { useState, useEffect } from "react";
import { KeyRound, Shield, Download, FileJson, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useVagasLocalStore } from "@/store/vagasStorage";
import { getHistory } from "@/lib/vagasPersistence";
import { exportToCSV, exportToJSON } from "@/lib/exportUtils";
import { VagaLocal } from "@/types";
import { logAudit } from "@/services/auditService";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { ChangePasswordCard } from "./ChangePasswordCard";

export const ConfiguracoesPage = () => {
  const { vagas_semana, vagas_feirao } = useVagasLocalStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const localLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
      setLogs([...localLogs].reverse().slice(0, 20));
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

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
                onClick={handleExportPDF}
              >
                <div className="p-3 rounded-xl bg-red-50 text-red-500 group-hover:bg-red-100 transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="block font-black text-foreground">Relatório PDF</span>
                </div>
              </Button>

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
                className="h-auto p-4 flex flex-col items-center gap-3 rounded-2xl border-border/60 hover:border-primary/50 hover:bg-primary/[0.02] transition-all group sm:col-span-2"
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <CardTitle className="font-heading font-black text-xl tracking-tight">Logs de Auditoria Local</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchLogs} disabled={loadingLogs} className="rounded-xl font-bold">
                {loadingLogs ? "Atualizando..." : "Recarregar"}
              </Button>
            </div>
            <CardDescription className="font-medium text-muted-foreground">Últimas 20 ações administrativas registradas neste navegador.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="bg-muted/10 rounded-2xl border border-border/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 text-left bg-muted/20">
                      <th className="py-3 px-4 font-black uppercase text-[10px] text-muted-foreground">Data/Hora</th>
                      <th className="py-3 px-4 font-black uppercase text-[10px] text-muted-foreground">Ação</th>
                      <th className="py-3 px-4 font-black uppercase text-[10px] text-muted-foreground">Entidade</th>
                      <th className="py-3 px-4 font-black uppercase text-[10px] text-muted-foreground">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground italic">Nenhum log encontrado.</td>
                      </tr>
                    ) : (
                      logs.map((log, i) => (
                        <tr key={log.id || i} className="hover:bg-primary/[0.01]">
                          <td className="py-3 px-4 text-xs font-medium text-muted-foreground">
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={cn(
                              "text-[9px] uppercase font-black px-1.5 h-5",
                              log.action === 'create' && "text-emerald-600 border-emerald-200 bg-emerald-50",
                              log.action === 'update' && "text-blue-600 border-blue-200 bg-blue-50",
                              log.action === 'delete' && "text-red-600 border-red-200 bg-red-50",
                              log.action === 'export' && "text-amber-600 border-amber-200 bg-amber-50"
                            )}>
                              {log.action}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-bold text-xs uppercase tracking-tighter">{log.entity_type}</td>
                          <td className="py-3 px-4 text-xs text-muted-foreground truncate max-w-[200px]" title={JSON.stringify(log.details)}>
                            {log.details?.descricao || log.details?.format || log.details?.novoPeriodo || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden bg-background border-border shadow-2xl">
          <DialogHeader className="p-6 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="font-heading font-black text-xl">Prévia do Relatório</DialogTitle>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 bg-muted/20 p-4 md:p-8 overflow-hidden flex items-center justify-center">
            {pdfPreviewData ? (
              <iframe 
                src={pdfPreviewData} 
                className="w-full h-full border-none rounded-lg shadow-inner bg-white"
                title="PDF Preview"
              />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="font-bold text-muted-foreground">Gerando prévia...</p>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 border-t bg-muted/20 flex gap-3">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="rounded-xl font-bold px-8">Fechar</Button>
            <Button className="rounded-xl font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/20" onClick={confirmDownloadPDF}>Baixar PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
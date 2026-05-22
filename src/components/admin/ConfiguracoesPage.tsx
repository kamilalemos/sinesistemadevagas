import { useState } from "react";
import { KeyRound, Shield, Download, FileJson, FileSpreadsheet, FileText, AlertTriangle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useVagasLocalStore } from "@/store/vagasStorage";
import { getHistory } from "@/lib/vagasPersistence";
import { exportToCSV, exportToJSON, exportToPDF, generatePDF } from "@/lib/exportUtils";
import { saveData } from "@/services/storage";

export const ConfiguracoesPage = () => {
  const { vagas_semana, vagas_feirao } = useVagasLocalStore();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfPreviewData, setPdfPreviewData] = useState<string | null>(null);
  const [currentFilename, setCurrentFilename] = useState("");
  

  const getConsolidatedMonthData = () => {
    const history = getHistory();
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const monthYear = `${year}_${month}`;
    
    // Find current month in history if available
    const currentHistory = history.find(h => h.year === year && String(h.month).padStart(2, '0') === month);
    
    const consolidatedVagas: VagaLocal[] = [];
    
    // Process current live data first (Week 3 as per current user setup)
    vagas_semana.filter(v => v.publicada).forEach(v => {
      consolidatedVagas.push({ ...v, periodo: "Semana Atual (18/05 a 22/05)" });
    });
    
    vagas_feirao.filter(v => v.publicada).forEach(v => {
      consolidatedVagas.push({ ...v, periodo: "Feirão da Empregabilidade" });
    });

    // Add other weeks from history if they exist for this month
    if (currentHistory) {
      Object.entries(currentHistory.weeks).forEach(([key, weekData]: [string, any]) => {
        // Skip current week if already added or add specifically
        const weekNum = key.split('_')[1];
        if (weekNum !== '3') { // Example: avoiding duplicates if live is week 3
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
    try {
      const data = getConsolidatedMonthData();
      if (data.vagas.length === 0) {
        toast.error("Nenhum dado publicado este mês para backup.");
        return;
      }

      const backupData = {
        mes: `${data.year}-${String(data.month).padStart(2, '0')}`,
        vagas: data.vagas,
        exportadoEm: new Date().toISOString(),
        versao: "1.2.0"
      };
      
      exportToJSON(backupData, `backup_mensal_${data.monthName.toLowerCase()}_${data.year}`);
    } catch (error) {
      console.error("Erro no backup JSON:", error);
      toast.error("Erro ao preparar backup JSON.");
    }
  };

  const handleExportCSV = () => {
    try {
      const data = getConsolidatedMonthData();
      if (data.vagas.length === 0) {
        toast.error("Nenhuma vaga publicada este mês para exportar.");
        return;
      }
      
      exportToCSV(data.vagas, `relatorio_mensal_${data.monthName.toLowerCase()}_${data.year}`);
    } catch (error) {
      console.error("Erro no export CSV:", error);
      toast.error("Erro ao preparar exportação CSV.");
    }
  };

  const handleExportPDF = () => {
    try {
      const data = getConsolidatedMonthData();
      if (data.vagas.length === 0) {
        toast.error("Nenhuma vaga publicada este mês para exportar.");
        return;
      }

      const title = `Relatório Mensal Consolidado - ${data.monthName} / ${data.year}`;
      const filename = `relatorio_mensal_${data.monthName.toLowerCase()}_${data.year}`;
      
      const doc = generatePDF(data.vagas, title, true);
      if (doc) {
        const pdfDataUri = doc.output('datauristring');
        setPdfPreviewData(pdfDataUri);
        setCurrentFilename(filename);
        setIsPreviewOpen(true);
      }
    } catch (error) {
      console.error("Erro no export PDF:", error);
      toast.error("Erro ao preparar exportação PDF.");
    }
  };

  const confirmDownloadPDF = () => {
    try {
      const link = document.createElement('a');
      link.href = pdfPreviewData!;
      link.download = `${currentFilename}.pdf`;
      link.click();
      setIsPreviewOpen(false);
      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      toast.error("Erro ao baixar PDF.");
    }
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
          <p className="text-muted-foreground font-medium pl-1">Gerencie a segurança e portabilidade dos seus dados.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Backup Card */}
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
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Visual & Oficial</span>
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
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Excel / Sheets</span>
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
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Para restauração futura</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>


        {/* Security Card */}
        <Card className="rounded-[2rem] border-border/60 shadow-card overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <KeyRound className="w-5 h-5" />
              </div>
              <CardTitle className="font-heading font-black text-xl tracking-tight">Segurança da Conta</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Senha Atual</Label>
                  <Input type="password" placeholder="********" className="h-12 rounded-xl bg-muted/20 border-border/40 font-medium" />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Nova Senha</Label>
                  <Input type="password" placeholder="********" className="h-12 rounded-xl bg-muted/20 border-border/40 font-medium" />
                </div>
                <Button className="w-full h-12 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20" onClick={() => toast.success("Senha alterada localmente!")}>
                  Atualizar Senha
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">E-mail do Novo Admin</Label>
                  <Input type="email" placeholder="admin@exemplo.com" className="h-12 rounded-xl bg-muted/20 border-border/40 font-medium" />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Senha Temporária</Label>
                  <Input type="password" placeholder="********" className="h-12 rounded-xl bg-muted/20 border-border/40 font-medium" />
                </div>
                <Button variant="secondary" className="w-full h-12 rounded-xl font-black text-sm uppercase tracking-widest" onClick={() => toast.success("Novo admin simulado com sucesso!")}>
                  Criar Acesso
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PDF Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden bg-background border-border shadow-2xl">
          <DialogHeader className="p-6 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="font-heading font-black text-xl">Prévia do Relatório Institucional</DialogTitle>
                <DialogDescription className="font-medium">Confirme o layout e os dados antes de finalizar o download.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 bg-muted/20 p-4 md:p-8 overflow-hidden flex items-center justify-center">
            {pdfPreviewData ? (
              <iframe 
                src={pdfPreviewData} 
                className="w-full h-full rounded-lg border border-border shadow-lg bg-white"
                title="PDF Preview"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <p className="font-bold uppercase tracking-widest text-xs">Gerando prévia...</p>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 border-t bg-muted/30 flex sm:justify-between items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">{currentFilename}.pdf</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="rounded-xl font-bold flex-1 sm:flex-none">
                Cancelar
              </Button>
              <Button onClick={confirmDownloadPDF} className="rounded-xl font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/20 flex-1 sm:flex-none">
                Baixar PDF Oficial
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-center gap-2 p-4 bg-muted/20 rounded-2xl border border-border/40">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Sistema operando via LocalStorage com persistência isolada</span>
      </div>
    </div>
  );
};

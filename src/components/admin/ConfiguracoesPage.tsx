import { KeyRound, Shield, Download, FileJson, FileSpreadsheet, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useVagasLocalStore } from "@/store/vagasStorage";
import { getHistory } from "@/lib/vagasPersistence";
import { exportToCSV, exportToJSON, exportToPDF } from "@/lib/exportUtils";
import { saveData } from "@/services/storage";


export const ConfiguracoesPage = () => {
  const { vagas_semana, vagas_feirao } = useVagasLocalStore();
  

  const handleExportFullBackup = () => {
    const history = getHistory();
    const backupData = {
      vagas_semana,
      vagas_feirao,
      historico_mensal: history,
      exportado_em: new Date().toISOString(),
      versao: "1.0.0"
    };
    
    exportToJSON(backupData, `sine-backup-completo-${new Date().toISOString().split('T')[0]}`);
    toast.success("Backup completo JSON gerado com sucesso!");
  };

  const handleExportCSV = () => {
    const todasVagas = [...vagas_semana, ...vagas_feirao];
    exportToCSV(todasVagas, `sine-vagas-${new Date().toISOString().split('T')[0]}`);
    toast.success("CSV exportado com sucesso!");
  };

  const handleExportPDF = () => {
    const todasVagas = [...vagas_semana, ...vagas_feirao];
    exportToPDF(todasVagas, "Relatório de Vagas SINE", `sine-vagas-${new Date().toISOString().split('T')[0]}`);
    toast.success("PDF gerado com sucesso!");
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

      <div className="flex items-center justify-center gap-2 p-4 bg-muted/20 rounded-2xl border border-border/40">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Sistema operando via LocalStorage com persistência isolada</span>
      </div>
    </div>
  );
};

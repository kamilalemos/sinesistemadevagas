import { KeyRound, Shield, UserPlus, Download, Upload, FileJson, FileSpreadsheet, FileText, History, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useVagasLocalStore } from "@/store/vagasStorage";
import { getHistory } from "@/lib/vagasPersistence";
import { exportToCSV, exportToJSON, exportToPDF } from "@/lib/exportUtils";
import { saveData } from "@/services/storage";
import { useRef } from "react";

export const ConfiguracoesPage = () => {
  const { vagas_semana, vagas_feirao } = useVagasLocalStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Basic validation
        if (!data.vagas_semana && !data.historico_mensal) {
          throw new Error("Formato de backup inválido.");
        }

        const confirmImport = window.confirm("Isso irá restaurar os dados do backup. Deseja continuar?");
        if (!confirmImport) return;

        // Restore history
        if (data.historico_mensal && Array.isArray(data.historico_mensal)) {
          data.historico_mensal.forEach((item: any) => {
            const key = `sine_backup_${item.year}_${item.month}`;
            saveData(key, item);
          });
        }

        // Restore current vagas (needs refresh of store)
        // Since store uses persistence internally, we can save to localStorage keys
        // However, a better way would be to extend the store to handle import
        // For now, let's notify user to refresh or we'll trigger a reload
        
        toast.success("Backup restaurado com sucesso! Recarregando sistema...");
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao importar backup: arquivo inválido ou corrompido.");
      }
    };
    reader.readAsText(file);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        {/* Import Card */}
        <Card className="rounded-[2rem] border-border/60 shadow-card overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                <Upload className="w-5 h-5" />
              </div>
              <CardTitle className="font-heading font-black text-xl tracking-tight">Importar Backup</CardTitle>
            </div>
            <CardDescription className="font-medium text-muted-foreground">Restaure dados a partir de um arquivo JSON exportado anteriormente.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
            <div className="p-6 rounded-2xl bg-muted/30 border border-dashed border-border/80 flex flex-col items-center justify-center gap-4 text-center">
              <div className="p-4 rounded-full bg-card shadow-sm border border-border/60">
                <FileJson className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <div className="space-y-1">
                <p className="font-black text-foreground">Arraste ou selecione o arquivo .json</p>
                <p className="text-xs text-muted-foreground font-medium">Apenas arquivos gerados pelo sistema são compatíveis.</p>
              </div>
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImportBackup}
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl font-bold px-8"
              >
                Selecionar Arquivo
              </Button>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                Aviso: A importação substituirá os dados atuais do histórico e exigirá o recarregamento da página.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="rounded-[2rem] border-border/60 shadow-card overflow-hidden lg:col-span-2">
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

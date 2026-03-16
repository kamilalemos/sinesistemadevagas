import { useState } from "react";
import { ArrowLeft, Upload, Lock, LogOut, Calendar, Loader2, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useVagasSemana, useVagasFeirao, useConfiguracoes, calcTotalVagas } from "@/hooks/useVagas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const Admin = () => {
  const { user, loading, isAdmin, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState<"semana" | "feirao" | null>(null);
  const [progressInfo, setProgressInfo] = useState<{ current: number; total: number; message: string } | null>(null);
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");
  const [periodoLoaded, setPeriodoLoaded] = useState(false);

  const { data: vagasSemana = [] } = useVagasSemana();
  const { data: vagasFeirao = [] } = useVagasFeirao();
  const { data: config } = useConfiguracoes();
  const queryClient = useQueryClient();

  // Load period from config once
  if (config && !periodoLoaded) {
    setPeriodoInicio(config.periodo_inicio || "");
    setPeriodoFim(config.periodo_fim || "");
    setPeriodoLoaded(true);
  }

  const handleLogin = async () => {
    setLoginLoading(true);
    const { error } = await signIn(email, password);
    setLoginLoading(false);
    if (error) {
      toast.error("Email ou senha incorretos");
    }
  };

  const handleFileUpload = async (tipo: "semana" | "feirao") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.txt,.csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploadLoading(tipo);
      setProgressInfo({ current: 0, total: 1, message: "Enviando arquivo..." });

      try {
        const formData = new FormData();
        formData.append("file", file);

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        // Use fetch directly for SSE streaming
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        const response = await fetch(`${supabaseUrl}/functions/v1/parse-pdf`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token || anonKey}`,
            "apikey": anonKey,
          },
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: "Erro desconhecido" }));
          toast.error("Erro ao processar arquivo: " + (errData.error || response.statusText));
          setUploadLoading(null);
          setProgressInfo(null);
          return;
        }

        // Read SSE stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let result: { vagas: any[]; totalVagas: number } | null = null;

        if (reader) {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const match = line.match(/^data: (.+)$/m);
              if (!match) continue;
              try {
                const data = JSON.parse(match[1]);
                if (data.type === "progress") {
                  setProgressInfo({ current: data.current, total: data.total, message: data.message });
                } else if (data.type === "done") {
                  result = { vagas: data.vagas, totalVagas: data.totalVagas };
                  setProgressInfo({ current: data.total || 1, total: data.total || 1, message: "Salvando vagas..." });
                } else if (data.type === "error") {
                  toast.error("Erro: " + data.error);
                }
              } catch {}
            }
          }
        }

        if (!result || !result.vagas || result.vagas.length === 0) {
          toast.error("Nenhuma vaga encontrada no arquivo. Verifique o formato do PDF.");
          setUploadLoading(null);
          setProgressInfo(null);
          return;
        }

        // Delete old vagas of this type
        const { error: deleteError } = await supabase.from("vagas").delete().eq("tipo", tipo);
        if (deleteError) {
          toast.error("Erro ao limpar vagas antigas");
          setUploadLoading(null);
          setProgressInfo(null);
          return;
        }

        // Insert new vagas
        const rows = result.vagas.map((v: any) => ({
          qtd: v.qtd,
          cbo: v.cbo || null,
          cargo: v.cargo,
          escolaridade: v.escolaridade,
          experiencia: v.experiencia,
          descricao: v.descricao,
          categoria: v.categoria,
          tipo,
        }));
        const { error: insertError } = await supabase.from("vagas").insert(rows);
        if (insertError) {
          toast.error("Erro ao salvar vagas: " + insertError.message);
          setUploadLoading(null);
          setProgressInfo(null);
          return;
        }

        queryClient.invalidateQueries({ queryKey: ["vagas", tipo] });
        toast.success(`${result.totalVagas} vagas extraídas e importadas com sucesso!`);
      } catch (err: any) {
        toast.error("Erro inesperado: " + (err.message || "Tente novamente"));
      }
      setUploadLoading(null);
      setProgressInfo(null);
    };
    input.click();
  };

  const handleUpdatePeriodo = async () => {
    const updates = [
      supabase.from("configuracoes").update({ valor: periodoInicio }).eq("chave", "periodo_inicio"),
      supabase.from("configuracoes").update({ valor: periodoFim }).eq("chave", "periodo_fim"),
    ];
    await Promise.all(updates);
    queryClient.invalidateQueries({ queryKey: ["configuracoes"] });
    toast.success("Período atualizado!");
  };

  if (loading) {
    return (
      <div className="pt-14 min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="pt-14 min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-2xl shadow-card p-6 w-full max-w-sm border border-border space-y-4">
          <div className="text-center">
            <Lock className="w-10 h-10 text-primary mx-auto mb-2" />
            <h1 className="font-heading font-bold text-lg text-foreground">Painel Administrativo</h1>
            <p className="text-muted-foreground text-xs">Acesso restrito — faça login com sua conta admin</p>
          </div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl"
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="rounded-xl"
          />
          <Button
            onClick={handleLogin}
            disabled={loginLoading}
            className="w-full rounded-xl font-heading font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Entrar
          </Button>
          {user && !isAdmin && (
            <p className="text-destructive text-xs text-center">Esta conta não possui permissão de administrador.</p>
          )}
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">
            ← Voltar ao site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-14 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-primary">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-heading font-bold text-lg text-foreground">Painel Admin</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </Button>
        </div>

        {/* Período */}
        <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
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
          <Button size="sm" onClick={handleUpdatePeriodo} className="rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 font-heading text-xs">
            Atualizar período
          </Button>
        </div>

        {/* Progress indicator */}
        {uploadLoading && progressInfo && (
          <div className="bg-card rounded-xl shadow-card p-5 border border-accent space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-heading font-semibold text-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                {progressInfo.message}
              </p>
              <span className="text-xs text-muted-foreground">
                {progressInfo.total > 1 ? `${progressInfo.current}/${progressInfo.total}` : ""}
              </span>
            </div>
            <Progress value={progressInfo.total > 0 ? (progressInfo.current / progressInfo.total) * 100 : 0} className="h-2" />
          </div>
        )}

        {/* Upload Semana */}
        <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
          <h2 className="font-heading font-semibold text-sm text-foreground">Vagas da Semana</h2>
          <p className="text-xs text-muted-foreground">
            Atual: {calcTotalVagas(vagasSemana)} vagas • {vagasSemana.length} cargos
          </p>
          <Button onClick={() => handleFileUpload("semana")} disabled={!!uploadLoading} className="w-full rounded-xl font-heading font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            {uploadLoading === "semana" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploadLoading === "semana" ? "Processando PDF..." : "Upload arquivo de vagas"}
          </Button>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Formatos: PDF, CSV ou TXT — extração automática de tabelas
          </p>
        </div>

        {/* Upload Feirão */}
        <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
          <h2 className="font-heading font-semibold text-sm text-foreground">Feirão da Empregabilidade</h2>
          <p className="text-xs text-muted-foreground">
            Atual: {calcTotalVagas(vagasFeirao)} vagas • {vagasFeirao.length} cargos
          </p>
          <Button onClick={() => handleFileUpload("feirao")} disabled={!!uploadLoading} className="w-full rounded-xl font-heading font-semibold gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
            {uploadLoading === "feirao" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploadLoading === "feirao" ? "Processando PDF..." : "Upload arquivo do feirão"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Admin;

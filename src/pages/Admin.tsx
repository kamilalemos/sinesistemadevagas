import { useState, useCallback } from "react";
import { ArrowLeft, Upload, Lock, LogOut, Calendar, Loader2, FileText, BarChart3, TrendingUp, Eye, EyeOff, Save, KeyRound, UserPlus, Trash2, Users, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useVagasSemana, useVagasFeirao, useConfiguracoes, calcTotalVagas, calcCategoriasComQtd } from "@/hooks/useVagas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";

interface HistoricoEntry {
  id: string;
  mes: number;
  ano: number;
  tipo: string;
  total_vagas: number;
  total_cargos: number;
  categorias: Record<string, number>;
}

const MESES = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

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
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [statsAno, setStatsAno] = useState(new Date().getFullYear());
  const [adminList, setAdminList] = useState<{ user_id: string; email: string; created_at: string | null }[]>([]);
  const [adminListLoading, setAdminListLoading] = useState(false);
  const [deleteAdminLoading, setDeleteAdminLoading] = useState<string | null>(null);

  const { data: vagasSemana = [] } = useVagasSemana();
  const { data: vagasFeirao = [] } = useVagasFeirao();
  const { data: config } = useConfiguracoes();
  const queryClient = useQueryClient();

  const { data: historico = [] } = useQuery<HistoricoEntry[]>({
    queryKey: ["vagas_historico", statsAno],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vagas_historico")
        .select("*")
        .eq("ano", statsAno)
        .order("mes", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as HistoricoEntry[];
    },
  });

  // Load period from config once
  if (config && !periodoLoaded) {
    setPeriodoInicio(config.periodo_inicio || "");
    setPeriodoFim(config.periodo_fim || "");
    setPeriodoLoaded(true);
  }

  const semanaAtiva = config?.semana_ativa !== "false";
  const feiraoAtivo = config?.feirao_ativo !== "false";

  const handleToggleSection = async (chave: string, valor: boolean) => {
    const { error } = await supabase
      .from("configuracoes")
      .update({ valor: valor ? "true" : "false" })
      .eq("chave", chave);
    if (error) {
      toast.error("Erro ao atualizar configuração");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["configuracoes"] });
    toast.success(`Seção ${chave === "semana_ativa" ? "Vagas da Semana" : "Feirão"} ${valor ? "ativada" : "desativada"}`);
  };

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

        const { error: deleteError } = await supabase.from("vagas").delete().eq("tipo", tipo);
        if (deleteError) {
          toast.error("Erro ao limpar vagas antigas");
          setUploadLoading(null);
          setProgressInfo(null);
          return;
        }

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

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setChangePasswordLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/create-admin`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "apikey": anonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "change-password", password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao alterar senha");
      } else {
        toast.success("Senha alterada com sucesso!");
        setNewPassword("");
      }
    } catch (err: any) {
      toast.error("Erro: " + (err.message || "Tente novamente"));
    }
    setChangePasswordLoading(false);
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword) {
      toast.error("Preencha email e senha do novo admin");
      return;
    }
    setCreateAdminLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/create-admin`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "apikey": anonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao criar admin");
      } else {
        toast.success("Novo admin criado com sucesso!");
        setNewAdminEmail("");
        setNewAdminPassword("");
      }
    } catch (err: any) {
      toast.error("Erro: " + (err.message || "Tente novamente"));
    }
    setCreateAdminLoading(false);
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

  const handleSalvarEstatistica = async () => {
    const now = new Date();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();

    const categoriasMap: Record<string, number> = {};
    vagasSemana.forEach((v) => {
      categoriasMap[v.categoria] = (categoriasMap[v.categoria] || 0) + v.qtd;
    });
    vagasFeirao.forEach((v) => {
      categoriasMap[v.categoria] = (categoriasMap[v.categoria] || 0) + v.qtd;
    });

    const totalVagas = calcTotalVagas(vagasSemana) + calcTotalVagas(vagasFeirao);
    const totalCargos = vagasSemana.length + vagasFeirao.length;

    const { error } = await supabase.from("vagas_historico").upsert(
      {
        mes,
        ano,
        tipo: "geral",
        total_vagas: totalVagas,
        total_cargos: totalCargos,
        categorias: categoriasMap,
      },
      { onConflict: "mes,ano,tipo" }
    );

    if (error) {
      toast.error("Erro ao salvar estatística: " + error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["vagas_historico"] });
    toast.success(`Estatística de ${MESES[mes]}/${ano} salva!`);
  };

  const maxVagas = Math.max(...historico.map((h) => h.total_vagas), 1);

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

        {/* Visibilidade das seções */}
        <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-secondary" />
            <h2 className="font-heading font-semibold text-sm text-foreground">Visibilidade das Seções</h2>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {semanaAtiva ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
              <span className="text-sm text-foreground">Vagas da Semana</span>
            </div>
            <Switch checked={semanaAtiva} onCheckedChange={(v) => handleToggleSection("semana_ativa", v)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {feiraoAtivo ? <Eye className="w-4 h-4 text-secondary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
              <span className="text-sm text-foreground">Feirão da Empregabilidade</span>
            </div>
            <Switch checked={feiraoAtivo} onCheckedChange={(v) => handleToggleSection("feirao_ativo", v)} />
          </div>
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

        {/* Dashboard Estatísticas */}
        <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h2 className="font-heading font-semibold text-sm text-foreground">Estatísticas de Vagas</h2>
            </div>
            <Button size="sm" variant="outline" onClick={handleSalvarEstatistica} className="rounded-lg text-xs gap-1">
              <Save className="w-3 h-3" /> Salvar mês atual
            </Button>
          </div>

          {/* Resumo atual */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-accent/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-heading font-bold text-primary">{calcTotalVagas(vagasSemana)}</p>
              <p className="text-xs text-muted-foreground">Semana</p>
            </div>
            <div className="bg-accent/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-heading font-bold text-secondary">{calcTotalVagas(vagasFeirao)}</p>
              <p className="text-xs text-muted-foreground">Feirão</p>
            </div>
            <div className="bg-accent/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-heading font-bold text-foreground">{calcTotalVagas(vagasSemana) + calcTotalVagas(vagasFeirao)}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>

          {/* Categorias atuais */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">VAGAS POR CATEGORIA (ATUAL)</p>
            <div className="space-y-1.5">
              {calcCategoriasComQtd(vagasSemana).filter(c => c.quantidade > 0).sort((a, b) => b.quantidade - a.quantidade).map((cat) => (
                <div key={cat.nome} className="flex items-center gap-2">
                  <span className="text-xs text-foreground w-24 truncate">{cat.nome}</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${(cat.quantidade / calcTotalVagas(vagasSemana)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-10 text-right">{cat.quantidade}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico anual */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> HISTÓRICO MENSAL
              </p>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setStatsAno(statsAno - 1)}>←</Button>
                <span className="text-xs font-heading font-bold text-foreground">{statsAno}</span>
                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setStatsAno(statsAno + 1)}>→</Button>
              </div>
            </div>

            {historico.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Nenhuma estatística salva para {statsAno}. Clique em "Salvar mês atual" para registrar.
              </p>
            ) : (
              <>
                {/* Bar chart */}
                <div className="flex items-end gap-1 h-32">
                  {Array.from({ length: 12 }, (_, i) => {
                    const entry = historico.find((h) => h.mes === i + 1);
                    const height = entry ? (entry.total_vagas / maxVagas) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] text-muted-foreground">{entry?.total_vagas || ""}</span>
                        <div
                          className="w-full rounded-t bg-primary/80 transition-all min-h-[2px]"
                          style={{ height: `${Math.max(height, entry ? 4 : 0)}%` }}
                        />
                        <span className="text-[9px] text-muted-foreground">{MESES[i + 1]}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="flex justify-between mt-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Total no ano</p>
                    <p className="text-lg font-heading font-bold text-foreground">
                      {historico.reduce((sum, h) => sum + h.total_vagas, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Média mensal</p>
                    <p className="text-lg font-heading font-bold text-foreground">
                      {historico.length > 0 ? Math.round(historico.reduce((sum, h) => sum + h.total_vagas, 0) / historico.length).toLocaleString() : 0}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Alterar Senha */}
        <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-secondary" />
            <h2 className="font-heading font-semibold text-sm text-foreground">Alterar Senha</h2>
          </div>
          <p className="text-xs text-muted-foreground">Altere a senha da sua conta admin atual ({user?.email})</p>
          <Input
            type="password"
            placeholder="Nova senha (mín. 6 caracteres)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded-lg text-sm"
          />
          <Button
            size="sm"
            onClick={handleChangePassword}
            disabled={changePasswordLoading}
            className="rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 font-heading text-xs gap-1"
          >
            {changePasswordLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <KeyRound className="w-3 h-3" />}
            Alterar senha
          </Button>
        </div>

        {/* Criar Novo Admin */}
        <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-semibold text-sm text-foreground">Criar Novo Admin</h2>
          </div>
          <p className="text-xs text-muted-foreground">Cadastre um novo usuário com permissão de administrador</p>
          <Input
            type="email"
            placeholder="Email do novo admin"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            className="rounded-lg text-sm"
          />
          <Input
            type="password"
            placeholder="Senha (mín. 6 caracteres)"
            value={newAdminPassword}
            onChange={(e) => setNewAdminPassword(e.target.value)}
            className="rounded-lg text-sm"
          />
          <Button
            size="sm"
            onClick={handleCreateAdmin}
            disabled={createAdminLoading}
            className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-heading text-xs gap-1"
          >
            {createAdminLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
            Criar admin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Admin;

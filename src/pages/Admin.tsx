import { useState, useCallback, useEffect } from "react";
import { Lock, Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { AdminSidebar } from "@/components/ui/admin-sidebar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useVagasSemana, useVagasFeirao, useConfiguracoes, calcTotalVagas } from "@/hooks/useVagas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";

import { SectionVisibilidade } from "@/components/admin/SectionVisibilidade";
import { SectionPeriodo } from "@/components/admin/SectionPeriodo";
import { SectionUpload } from "@/components/admin/SectionUpload";
import { SectionEstatisticas } from "@/components/admin/SectionEstatisticas";
import { SectionSenha } from "@/components/admin/SectionSenha";
import { SectionAdmins } from "@/components/admin/SectionAdmins";
import { SectionCadastroManual } from "@/components/admin/SectionCadastroManual";

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
const SUMMARY_ROW_REGEX = /(total de vagas|total geral|vagas abertas|feirão da empregabilidade|quantidade total|total\b)/i;

const sanitizeUploadedVagas = (vagas: any[]) =>
  vagas
    .map((vaga) => {
      const qtd = Number(vaga?.qtd);
      const cargo = String(vaga?.cargo || "").trim();
      if (!Number.isInteger(qtd) || qtd <= 0 || qtd > 9999 || !cargo || SUMMARY_ROW_REGEX.test(cargo)) return null;
      return {
        qtd,
        cbo: vaga?.cbo || null,
        cargo,
        escolaridade: String(vaga?.escolaridade || "Não informado").trim(),
        experiencia: String(vaga?.experiencia || "Não informada").trim(),
        descricao: String(vaga?.descricao || "").trim(),
        categoria: String(vaga?.categoria || "Serviços").trim() || "Serviços",
      };
    })
    .filter((vaga): vaga is NonNullable<typeof vaga> => Boolean(vaga));

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
  
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  const { data: vagasSemana = [] } = useVagasSemana();
  const { data: vagasFeirao = [] } = useVagasFeirao();
  const { data: config } = useConfiguracoes();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkSetup = async () => {
      const { data, error } = await supabase.rpc("is_setup_needed");
      if (!error) setSetupNeeded(!!data);
    };
    checkSetup();
  }, []);

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

  if (config && !periodoLoaded) {
    setPeriodoInicio(config.periodo_inicio || "");
    setPeriodoFim(config.periodo_fim || "");
    setPeriodoLoaded(true);
  }

  const semanaAtiva = config?.semana_ativa !== "false";
  const feiraoAtivo = config?.feirao_ativo !== "false";

  // --- Handlers ---

  const handleToggleSection = async (chave: string, valor: boolean) => {
    const { error } = await supabase.from("configuracoes").update({ valor: valor ? "true" : "false" }).eq("chave", chave);
    if (error) { toast.error("Erro ao atualizar configuração"); return; }
    queryClient.invalidateQueries({ queryKey: ["configuracoes"] });
    toast.success(`Seção ${chave === "semana_ativa" ? "Vagas da Semana" : "Feirão"} ${valor ? "ativada" : "desativada"}`);
  };

  const handleLogin = async () => {
    setLoginLoading(true);
    const { error } = await signIn(email, password);
    setLoginLoading(false);
    if (error) toast.error("Email ou senha incorretos");
    else {
      // Se o setup for necessário, tenta inicializar após o login bem sucedido
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        const { data: setupData } = await supabase.rpc("is_setup_needed");
        if (setupData) {
          const { error: initError } = await supabase.rpc("initialize_admin", { _user_id: sessionData.session.user.id });
          if (!initError) {
            toast.success("Primeiro administrador configurado com sucesso!");
            setSetupNeeded(false);
            // Refresh to update isAdmin state in useAuth
            window.location.reload();
          }
        }
      }
    }
  };

  const handleCreateInitialAccount = async () => {
    if (!email || !password) { toast.error("Preencha email e senha"); return; }
    setSetupLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        // Se o erro for que o usuário já existe, tenta fazer login e promover
        if (error.message.includes("already registered")) {
           await handleLogin();
        } else {
          toast.error(error.message);
        }
      } else if (data.user) {
        // Tenta inicializar
        const { error: initError } = await supabase.rpc("initialize_admin", { _user_id: data.user.id });
        if (!initError) {
          toast.success("Conta criada e configurada como administrador!");
          setSetupNeeded(false);
          // O hook useAuth deve detectar a sessão e isAdmin mudará
          window.location.reload();
        } else {
          toast.info("Conta criada! Por favor, faça login para ativar o acesso admin.");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar conta inicial");
    }
    setSetupLoading(false);
  };

  const callEdgeFunction = async (body: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const res = await fetch(`${supabaseUrl}/functions/v1/create-admin`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "apikey": anonKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { res, data: await res.json() };
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
          headers: { "Authorization": `Bearer ${token || anonKey}`, "apikey": anonKey },
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: "Erro desconhecido" }));
          toast.error("Erro ao processar arquivo: " + (errData.error || response.statusText));
          setUploadLoading(null); setProgressInfo(null); return;
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
                if (data.type === "progress") setProgressInfo({ current: data.current, total: data.total, message: data.message });
                else if (data.type === "done") { result = { vagas: data.vagas, totalVagas: data.totalVagas }; setProgressInfo({ current: data.total || 1, total: data.total || 1, message: "Salvando vagas..." }); }
                else if (data.type === "error") toast.error("Erro: " + data.error);
              } catch {}
            }
          }
        }

        const sanitizedVagas = sanitizeUploadedVagas(result?.vagas || []);
        if (sanitizedVagas.length === 0) { toast.error("Nenhuma vaga válida encontrada no arquivo."); setUploadLoading(null); setProgressInfo(null); return; }

        const { error: deleteError } = await supabase.from("vagas").delete().eq("tipo", tipo);
        if (deleteError) { toast.error("Erro ao limpar vagas antigas"); setUploadLoading(null); setProgressInfo(null); return; }

        const { error: insertError } = await supabase.from("vagas").insert(sanitizedVagas.map((v) => ({ ...v, tipo })));
        if (insertError) { toast.error("Erro ao salvar vagas: " + insertError.message); setUploadLoading(null); setProgressInfo(null); return; }

        const totalImportado = result?.totalVagas ?? sanitizedVagas.reduce((sum, v) => sum + v.qtd, 0);
        const chaveTotal = tipo === "feirao" ? "feirao_total_vagas" : "semana_total_vagas";
        await supabase.from("configuracoes").upsert({ chave: chaveTotal, valor: String(totalImportado) }, { onConflict: "chave" });
        queryClient.invalidateQueries({ queryKey: ["vagas", tipo] });
        queryClient.invalidateQueries({ queryKey: ["configuracoes"] });
        toast.success(`${totalImportado} vagas extraídas e importadas com sucesso!`);
      } catch (err: any) {
        toast.error("Erro inesperado: " + (err.message || "Tente novamente"));
      }
      setUploadLoading(null); setProgressInfo(null);
    };
    input.click();
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast.error("A senha deve ter pelo menos 6 caracteres"); return; }
    setChangePasswordLoading(true);
    try {
      const { res, data } = await callEdgeFunction({ action: "change-password", password: newPassword });
      if (!res.ok) toast.error(data.error || "Erro ao alterar senha");
      else { toast.success("Senha alterada com sucesso!"); setNewPassword(""); }
    } catch (err: any) { toast.error("Erro: " + (err.message || "Tente novamente")); }
    setChangePasswordLoading(false);
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword) { toast.error("Preencha email e senha do novo admin"); return; }
    setCreateAdminLoading(true);
    try {
      const { res, data } = await callEdgeFunction({ email: newAdminEmail, password: newAdminPassword });
      if (!res.ok) toast.error(data.error || "Erro ao criar admin");
      else { toast.success("Novo admin criado com sucesso!"); setNewAdminEmail(""); setNewAdminPassword(""); }
    } catch (err: any) { toast.error("Erro: " + (err.message || "Tente novamente")); }
    setCreateAdminLoading(false);
  };

  const fetchAdminList = useCallback(async () => {
    setAdminListLoading(true);
    try {
      const { res, data } = await callEdgeFunction({ action: "list-admins" });
      if (res.ok) setAdminList(data.admins || []);
      else toast.error(data.error || "Erro ao listar admins");
    } catch (err: any) { toast.error("Erro: " + (err.message || "Tente novamente")); }
    setAdminListLoading(false);
  }, []);

  const handleDeleteAdmin = async (targetUserId: string, targetEmail: string) => {
    if (!confirm(`Tem certeza que deseja remover o admin "${targetEmail}"? Esta ação é irreversível.`)) return;
    setDeleteAdminLoading(targetUserId);
    try {
      const { res, data } = await callEdgeFunction({ action: "delete-admin", target_user_id: targetUserId });
      if (res.ok) { toast.success("Admin removido com sucesso!"); fetchAdminList(); }
      else toast.error(data.error || "Erro ao remover admin");
    } catch (err: any) { toast.error("Erro: " + (err.message || "Tente novamente")); }
    setDeleteAdminLoading(null);
  };

  const handleUpdatePeriodo = async () => {
    await Promise.all([
      supabase.from("configuracoes").update({ valor: periodoInicio }).eq("chave", "periodo_inicio"),
      supabase.from("configuracoes").update({ valor: periodoFim }).eq("chave", "periodo_fim"),
    ]);
    queryClient.invalidateQueries({ queryKey: ["configuracoes"] });
    toast.success("Período atualizado!");
  };

  const handleSalvarEstatistica = async () => {
    const now = new Date();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();
    const categoriasMap: Record<string, number> = {};
    vagasSemana.forEach((v) => { categoriasMap[v.categoria] = (categoriasMap[v.categoria] || 0) + v.qtd; });
    vagasFeirao.forEach((v) => { categoriasMap[v.categoria] = (categoriasMap[v.categoria] || 0) + v.qtd; });
    const totalVagas = calcTotalVagas(vagasSemana) + calcTotalVagas(vagasFeirao);
    const totalCargos = vagasSemana.length + vagasFeirao.length;
    const { error } = await supabase.from("vagas_historico").upsert(
      { mes, ano, tipo: "geral", total_vagas: totalVagas, total_cargos: totalCargos, categorias: categoriasMap },
      { onConflict: "mes,ano,tipo" }
    );
    if (error) { toast.error("Erro ao salvar estatística: " + error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["vagas_historico"] });
    toast.success(`Estatística de ${MESES[mes]}/${ano} salva!`);
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="pt-14 min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    if (setupNeeded) {
      return (
        <div className="pt-14 min-h-screen bg-background flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl shadow-card p-6 w-full max-w-sm border border-border space-y-4">
            <div className="text-center">
              <UserPlus className="w-10 h-10 text-primary mx-auto mb-2" />
              <h1 className="font-heading font-bold text-lg text-foreground">Configuração Inicial</h1>
              <p className="text-muted-foreground text-xs text-balance">
                Nenhum administrador detectado. Crie a primeira conta para gerenciar o portal.
              </p>
            </div>
            <Input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" />
            <Input type="password" placeholder="Sua senha (mín. 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreateInitialAccount()} className="rounded-xl" />
            <Button onClick={handleCreateInitialAccount} disabled={setupLoading} className="w-full rounded-xl font-heading font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
              {setupLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
              Criar Primeiro Admin
            </Button>
            <p className="text-[10px] text-muted-foreground text-center px-2">
              Se você já tem uma conta mas não é admin, faça o login acima para se tornar o primeiro administrador.
            </p>
            <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">← Voltar ao site</Link>
          </div>
        </div>
      );
    }

    return (
      <div className="pt-14 min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-2xl shadow-card p-6 w-full max-w-sm border border-border space-y-4">
          <div className="text-center">
            <Lock className="w-10 h-10 text-primary mx-auto mb-2" />
            <h1 className="font-heading font-bold text-lg text-foreground">Painel Administrativo</h1>
            <p className="text-muted-foreground text-xs">Acesso restrito — faça login com sua conta admin</p>
          </div>
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" />
          <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="rounded-xl" />
          <Button onClick={handleLogin} disabled={loginLoading} className="w-full rounded-xl font-heading font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
            {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Entrar
          </Button>
          {user && !isAdmin && <p className="text-destructive text-xs text-center">Esta conta não possui permissão de administrador.</p>}
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">← Voltar ao site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-14 min-h-screen bg-background flex">
      <AdminSidebar userEmail={user?.email} onSignOut={signOut} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <SectionVisibilidade semanaAtiva={semanaAtiva} feiraoAtivo={feiraoAtivo} onToggle={handleToggleSection} />
          <SectionPeriodo periodoInicio={periodoInicio} periodoFim={periodoFim} setPeriodoInicio={setPeriodoInicio} setPeriodoFim={setPeriodoFim} onUpdate={handleUpdatePeriodo} />
          <SectionUpload tipo="semana" label="Vagas da Semana" totalVagas={calcTotalVagas(vagasSemana)} totalCargos={vagasSemana.length} uploadLoading={uploadLoading} progressInfo={progressInfo} onUpload={handleFileUpload} />
          <SectionUpload tipo="feirao" label="Feirão da Empregabilidade" totalVagas={calcTotalVagas(vagasFeirao)} totalCargos={vagasFeirao.length} uploadLoading={uploadLoading} progressInfo={progressInfo} onUpload={handleFileUpload} variant="secondary" />
          <SectionEstatisticas vagasSemana={vagasSemana} vagasFeirao={vagasFeirao} historico={historico} statsAno={statsAno} setStatsAno={setStatsAno} onSalvarEstatistica={handleSalvarEstatistica} />
          <SectionSenha userEmail={user?.email || ""} newPassword={newPassword} setNewPassword={setNewPassword} loading={changePasswordLoading} onChangePassword={handleChangePassword} />
          <SectionAdmins
            currentUserId={user?.id || ""}
            newAdminEmail={newAdminEmail} setNewAdminEmail={setNewAdminEmail}
            newAdminPassword={newAdminPassword} setNewAdminPassword={setNewAdminPassword}
            createLoading={createAdminLoading} onCreateAdmin={handleCreateAdmin}
            adminList={adminList} adminListLoading={adminListLoading} deleteAdminLoading={deleteAdminLoading}
            onFetchAdminList={fetchAdminList} onDeleteAdmin={handleDeleteAdmin}
          />
        </div>
      </div>
    </div>
  );
};

export default Admin;

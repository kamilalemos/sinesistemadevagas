import { useState } from "react";
import { ArrowLeft, Upload, Lock, LogOut, Calendar, Loader2, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const detectarCategoria = (cargo: string): string => {
    const c = cargo.toLowerCase();
    if (c.includes("desenvolv") || c.includes("técnico") || c.includes("ti") || c.includes("program")) return "Tecnologia";
    if (c.includes("admin") || c.includes("recep") || c.includes("secretár") || c.includes("auxiliar admin")) return "Administrativo";
    if (c.includes("vend") || c.includes("comerci")) return "Vendas";
    if (c.includes("market") || c.includes("design") || c.includes("comunic")) return "Marketing";
    if (c.includes("motor") || c.includes("logíst") || c.includes("entrega") || c.includes("estoque")) return "Logística";
    if (c.includes("oper") || c.includes("produção") || c.includes("industr") || c.includes("soldad")) return "Indústria";
    return "Serviços";
  };

  const parsePDFText = (text: string) => {
    const lines = text.split("\n").filter((l) => l.trim());
    const vagas: { qtd: number; cargo: string; escolaridade: string; experiencia: string; descricao: string; categoria: string; cbo?: string }[] = [];
    for (const line of lines) {
      const parts = line.split(/\t|;|,/).map((p) => p.trim());
      if (parts.length >= 4) {
        const qtd = parseInt(parts[0]);
        if (!isNaN(qtd) && qtd > 0) {
          const cargo = parts[1] || "Cargo não informado";
          vagas.push({
            qtd,
            cargo,
            escolaridade: parts[2] || "Não informado",
            experiencia: parts[3] || "Não informada",
            descricao: parts[4] || "",
            categoria: detectarCategoria(cargo),
          });
        }
      }
    }
    return vagas;
  };

  const handleFileUpload = async (tipo: "semana" | "feirao") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.txt,.csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const vagas = parsePDFText(text);

      if (vagas.length === 0) {
        toast.error("Não foi possível extrair vagas. Use CSV/TXT: Qtd;Cargo;Escolaridade;Experiência;Descrição");
        return;
      }

      // Delete old vagas of this type
      const { error: deleteError } = await supabase.from("vagas").delete().eq("tipo", tipo);
      if (deleteError) {
        toast.error("Erro ao limpar vagas antigas");
        return;
      }

      // Insert new vagas
      const rows = vagas.map((v) => ({ ...v, tipo }));
      const { error: insertError } = await supabase.from("vagas").insert(rows);
      if (insertError) {
        toast.error("Erro ao insertar vagas: " + insertError.message);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["vagas", tipo] });
      toast.success(`${vagas.reduce((s, v) => s + v.qtd, 0)} vagas importadas com sucesso!`);
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

        {/* Upload Semana */}
        <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
          <h2 className="font-heading font-semibold text-sm text-foreground">Vagas da Semana</h2>
          <p className="text-xs text-muted-foreground">
            Atual: {calcTotalVagas(vagasSemana)} vagas • {vagasSemana.length} cargos
          </p>
          <Button onClick={() => handleFileUpload("semana")} className="w-full rounded-xl font-heading font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Upload className="w-4 h-4" />
            Upload arquivo de vagas
          </Button>
          <p className="text-xs text-muted-foreground">Formatos: CSV ou TXT separado por ; ou tab</p>
        </div>

        {/* Upload Feirão */}
        <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
          <h2 className="font-heading font-semibold text-sm text-foreground">Feirão da Empregabilidade</h2>
          <p className="text-xs text-muted-foreground">
            Atual: {calcTotalVagas(vagasFeirao)} vagas • {vagasFeirao.length} cargos
          </p>
          <Button onClick={() => handleFileUpload("feirao")} className="w-full rounded-xl font-heading font-semibold gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Upload className="w-4 h-4" />
            Upload arquivo do feirão
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Admin;

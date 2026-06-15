import { useState } from "react";
import { Lock, Loader2, ShieldCheck, Eye, EyeOff, UserPlus } from "lucide-react";
import { AdminSidebar } from "@/components/ui/admin-sidebar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

import { DashboardPage } from "@/components/admin/DashboardPage";
import { CadastroVagasPage } from "@/components/admin/CadastroVagasPage";
import { VisibilidadePage } from "@/components/admin/VisibilidadePage";
import { ConfiguracoesPage } from "@/components/admin/ConfiguracoesPage";
import { HistoricoPage } from "@/components/admin/HistoricoPage";

const Admin = () => {
  const { user, loading, isAdmin, hasAdmin, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");

  const isSetup = !hasAdmin;

  const handleLogin = async () => {
    setLoginLoading(true);
    const { error } = await signIn(email, password);
    setLoginLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Login realizado com sucesso!");
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    setLoginLoading(true);
    const { error } = await signUp(email, password);
    setLoginLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Administrador criado com sucesso!");
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
            <p className="text-muted-foreground text-xs">Identifique-se para acessar as configurações.</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <Input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1 relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Senha" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && handleLogin()} 
                className="rounded-xl pr-10" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button onClick={handleLogin} disabled={loginLoading} className="w-full rounded-xl font-heading font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
              {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
              Entrar no Painel
            </Button>
          </div>
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">← Voltar ao site</Link>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard": return <DashboardPage />;
      case "cadastro-vagas": return <CadastroVagasPage />;
      case "visibilidade": return <VisibilidadePage />;
      case "historico": return <HistoricoPage />;
      case "configuracoes": return <ConfiguracoesPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <AdminSidebar 
          userEmail={user.email} 
          onSignOut={signOut} 
          activeItem={activeSection}
          onItemClick={setActiveSection}
        />
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 overflow-y-auto max-h-screen">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
import { useEffect, useRef, useState } from "react";
import { Lock, Loader2, ShieldCheck, Eye, EyeOff, UserPlus, Menu, X } from "lucide-react";
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
import { AdminsPage } from "@/components/admin/AdminsPage";

const Admin = () => {
  const { user, loading, isAdmin, hasAdmin, permissions, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("sidebarCollapsed") === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed));
    } catch {}
  }, [sidebarCollapsed]);

  // Lock background scroll while mobile drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Return focus to main content when drawer closes
  useEffect(() => {
    if (!mobileOpen) {
      mainRef.current?.focus?.();
    }
  }, [mobileOpen]);

  const sectionTitles: Record<string, string> = {
    dashboard: "Dashboard",
    "cadastro-vagas": "Cadastro de Vagas",
    visibilidade: "Visibilidade",
    historico: "Histórico Mensal",
    admins: "Administradores",
    configuracoes: "Configurações",
  };

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
            {isSetup ? (
              <UserPlus className="w-10 h-10 text-primary mx-auto mb-2" />
            ) : (
              <Lock className="w-10 h-10 text-primary mx-auto mb-2" />
            )}
            <h1 className="font-heading font-bold text-lg text-foreground">
              {isSetup ? "Criar Administrador" : "Painel Administrativo"}
            </h1>
            <p className="text-muted-foreground text-xs">
              {isSetup
                ? "Nenhum administrador encontrado. Crie o primeiro acesso."
                : "Identifique-se para acessar as configurações."}
            </p>
          </div>
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
            />
            <div className="space-y-1 relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={isSetup ? "Senha (mín. 6 caracteres)" : "Senha"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isSetup && handleLogin()}
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
            {isSetup && (
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                className="rounded-xl"
              />
            )}
            <Button
              onClick={isSetup ? handleSignUp : handleLogin}
              disabled={loginLoading}
              className="w-full rounded-xl font-heading font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loginLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : isSetup ? (
                <UserPlus className="w-4 h-4 mr-2" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-2" />
              )}
              {isSetup ? "Criar Administrador" : "Entrar no Painel"}
            </Button>
          </div>
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">← Voltar ao site</Link>
        </div>
      </div>
    );
  }

  const can = (perm: string) => permissions.includes(perm as any);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard": return can("dashboard") ? <DashboardPage /> : <NoPermission />;
      case "cadastro-vagas": return can("cadastro-vagas") ? <CadastroVagasPage /> : <NoPermission />;
      case "visibilidade": return can("visibilidade") ? <VisibilidadePage /> : <NoPermission />;
      case "historico": return can("historico") ? <HistoricoPage /> : <NoPermission />;
      case "admins": return can("admins") ? <AdminsPage /> : <NoPermission />;
      case "configuracoes": return can("configuracoes") ? <ConfiguracoesPage /> : <NoPermission />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-muted/30">
      <div className="flex h-full">
        <AdminSidebar
          userEmail={user.email ?? ""}
          onSignOut={signOut}
          activeItem={activeSection}
          onItemClick={setActiveSection}
          allowedItems={permissions}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
        />
        <main
          ref={mainRef}
          tabIndex={-1}
          className="flex-1 flex flex-col overflow-hidden min-w-0 outline-none"
        >
          {/* Topbar institucional */}
          <header className="h-16 lg:h-[68px] shrink-0 bg-primary text-primary-foreground border-b border-primary/20 flex items-center gap-4 lg:gap-6 px-5 lg:px-6 overflow-hidden z-30 shadow-sm">
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileOpen((v) => !v);
                } else {
                  setSidebarCollapsed((v) => !v);
                }
              }}
              aria-label="Abrir ou fechar menu"
              aria-controls="admin-sidebar"
              aria-expanded={mobileOpen || !sidebarCollapsed}
              className="inline-flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="font-heading font-bold text-base lg:text-lg text-white truncate min-w-0">
              {sectionTitles[activeSection] ?? "Painel"}
            </h1>
            <div className="ml-auto flex items-center gap-3 min-w-0">
              <span className="hidden sm:inline text-xs text-white/70 truncate max-w-[220px]">
                {user.email}
              </span>
            </div>
          </header>

          <section className="flex-1 min-h-0 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-6 lg:py-8 animate-fade-in">
              {renderContent()}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

const NoPermission = () => (
  <div className="bg-card border border-border rounded-2xl p-8 text-center">
    <h2 className="font-heading font-bold text-lg text-foreground mb-2">
      Acesso restrito
    </h2>
    <p className="text-sm text-muted-foreground">
      Você não possui permissão para acessar esta seção. Peça a um administrador
      para liberar.
    </p>
  </div>
);

export default Admin;
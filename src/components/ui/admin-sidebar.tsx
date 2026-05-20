"use client";
import React, { useState, useEffect } from "react";
import {
  Home,
  Eye,
  Calendar,
  Upload,
  Briefcase,
  BarChart3,
  KeyRound,
  UserPlus,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  { id: "visibilidade", name: "Visibilidade", icon: Eye },
  { id: "periodo", name: "Período", icon: Calendar },
  { id: "cadastro-vagas", name: "Cadastro de Vagas", icon: Briefcase },
  { id: "estatisticas", name: "Estatísticas", icon: BarChart3 },
  { id: "alterar-senha", name: "Alterar Senha", icon: KeyRound },
  { id: "criar-admin", name: "Criar Admin", icon: UserPlus },
  { id: "listar-admins", name: "Administradores", icon: Users },
];

interface AdminSidebarProps {
  userEmail?: string;
  onSignOut: () => void;
  activeItem: string;
  onItemClick: (itemId: string) => void;
}

export function AdminSidebar({ userEmail, onSignOut, activeItem, onItemClick }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("visibilidade");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    const el = document.getElementById(`section-${itemId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-[72px] left-3 z-50 lg:hidden bg-card border border-border rounded-lg p-2 shadow-card"
      >
        {isOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-14 left-0 bottom-0 z-40 bg-card border-r border-border
          flex flex-col transition-all duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-16" : "w-60"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-heading font-bold text-foreground truncate">Painel Admin</p>
                <p className="text-[10px] text-muted-foreground truncate">SINE João Pessoa</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md hover:bg-accent text-muted-foreground transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group relative
                  ${isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }
                  ${isCollapsed ? "justify-center px-2" : ""}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                {!isCollapsed && (
                  <span className="text-sm truncate">{item.name}</span>
                )}
                {/* Tooltip for collapsed */}
                {isCollapsed && (
                  <span className="
                    absolute left-full ml-2 px-2 py-1 rounded-md text-xs font-medium
                    bg-foreground text-background whitespace-nowrap
                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50
                  ">
                    {item.name}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: user + logout */}
        <div className="border-t border-border p-3 space-y-2">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 px-1">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-foreground">
                  {userEmail?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{userEmail || "Admin"}</p>
                <p className="text-[10px] text-muted-foreground">Administrador</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <span className="text-xs font-bold text-foreground">
                  {userEmail?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={onSignOut}
            className={`
              w-full flex items-center rounded-lg text-left transition-all duration-200 group
              text-destructive hover:bg-destructive/10
              ${isCollapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2.5"}
            `}
            title={isCollapsed ? "Sair" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="text-sm">Sair</span>}
            {isCollapsed && (
              <span className="
                absolute left-full ml-2 px-2 py-1 rounded-md text-xs font-medium
                bg-foreground text-background whitespace-nowrap
                opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50
              ">
                Sair
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

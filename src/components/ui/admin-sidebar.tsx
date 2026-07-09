"use client";
import React, { useEffect } from "react";
import {
  LayoutDashboard,
  Eye,
  Briefcase,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  History,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "cadastro-vagas", name: "Cadastro de Vagas", icon: Briefcase },
  { id: "visibilidade", name: "Visibilidade", icon: Eye },
  { id: "historico", name: "Histórico Mensal", icon: History },
  { id: "admins", name: "Administradores", icon: Shield },
  { id: "configuracoes", name: "Configurações", icon: Settings },
];

interface AdminSidebarProps {
  userEmail?: string;
  onSignOut: () => void;
  activeItem: string;
  onItemClick: (itemId: string) => void;
  allowedItems?: string[];
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (v: boolean) => void;
}

export function AdminSidebar({
  userEmail,
  onSignOut,
  activeItem,
  onItemClick,
  allowedItems,
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileOpenChange,
}: AdminSidebarProps) {
  // Close mobile drawer with Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMobileOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onMobileOpenChange]);

  const handleItemClick = (itemId: string) => {
    onItemClick(itemId);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onMobileOpenChange(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => onMobileOpenChange(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        id="admin-sidebar"
        role="navigation"
        aria-label="Navegação administrativa"
        className={cn(
          "fixed top-0 left-0 bottom-0 z-[60] bg-primary border-r border-primary/20 flex flex-col shadow-2xl",
          "transition-[transform,width] duration-300 ease-in-out",
          "lg:relative lg:top-auto lg:left-auto lg:bottom-auto lg:h-screen lg:shrink-0 lg:shadow-none lg:z-40",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-[280px] lg:w-[72px]" : "w-[280px] lg:w-[280px]"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-20 lg:h-24 flex items-center gap-3 px-4 border-b border-primary/10 bg-primary">
          {!collapsed ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-white/10 rounded-xl">
                <img src="/logo-sine.png" alt="SINE Logo" className="h-10 w-auto object-contain" />
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center justify-center w-full">
              <Shield className="w-6 h-6 text-white" />
            </div>
          )}
          <button
            onClick={() => onCollapsedChange(!collapsed)}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 min-h-0 overflow-y-auto py-6 px-3 space-y-1.5 scrollbar-hide">
          {navigationItems
            .filter((item) => !allowedItems || allowedItems.includes(item.id))
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group relative",
                    isActive
                      ? "bg-white text-primary shadow-md font-bold"
                      : "text-white/70 hover:bg-white/10 hover:text-white font-semibold",
                    collapsed && "lg:justify-center lg:px-0"
                  )}
                  title={collapsed ? item.name : undefined}
                  aria-label={item.name}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                      isActive ? "text-primary" : "text-white/40 group-hover:text-white"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[13px] tracking-tight",
                      collapsed && "lg:hidden"
                    )}
                  >
                    {item.name}
                  </span>
                  {isActive && !collapsed && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary/40" />
                  )}
                </button>
              );
            })}

          <div className="pt-6 mt-6 border-t border-white/10">
            <Link
              to="/"
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 font-bold bg-white/10 text-white hover:bg-white/20",
                collapsed && "lg:justify-center lg:px-0"
              )}
              title={collapsed ? "Ir para o Site" : undefined}
            >
              <ExternalLink className="w-5 h-5 shrink-0" />
              <span className={cn("text-[13px] tracking-tight", collapsed && "lg:hidden")}>
                Ir para o Site
              </span>
            </Link>
          </div>
        </nav>

        {/* Footer / User Area */}
        <div className="p-3 bg-primary border-t border-white/10 mt-auto space-y-2">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-2 py-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <span className="text-sm font-black text-white">
                  {userEmail?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-white truncate tracking-tight">
                  {userEmail || "Admin"}
                </p>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                  Acesso Gestor
                </p>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex justify-center py-2">
              <div
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10"
                title={userEmail || "Admin"}
              >
                <span className="text-sm font-black text-white">
                  {userEmail?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={onSignOut}
            className={cn(
              "w-full flex items-center rounded-xl text-left transition-all duration-200 font-bold text-white hover:bg-white/10",
              collapsed ? "lg:justify-center lg:p-3 gap-3 px-4 py-3" : "gap-3 px-4 py-3"
            )}
            title={collapsed ? "Sair" : undefined}
            aria-label="Encerrar sessão"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={cn("text-[13px]", collapsed && "lg:hidden")}>Encerrar Sessão</span>
          </button>
        </div>
      </aside>
    </>
  );
}

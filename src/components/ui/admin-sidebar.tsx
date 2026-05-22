"use client";
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Eye,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  History,
  Layout
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

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
  { id: "configuracoes", name: "Configurações", icon: Settings },
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
    onItemClick(itemId);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-border z-[60] flex items-center px-4 lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="ml-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-extrabold text-sm text-foreground">Painel Admin</span>
        </div>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-[60] bg-white border-r border-border flex flex-col transition-all duration-400 ease-in-out shadow-2xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-20" : "w-[280px] lg:w-64",
          "lg:z-40"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 lg:h-20 flex items-center gap-3 px-6 border-b border-border bg-muted/5">
          {!isCollapsed && (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-heading font-extrabold text-foreground truncate uppercase tracking-tight">João Pessoa</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Painel Admin</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-200"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all duration-300 group relative",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20 font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground font-semibold",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-muted-foreground/60 group-hover:text-primary")} />
                {!isCollapsed && (
                  <span className="text-sm tracking-tight">{item.name}</span>
                )}
                
                {isActive && !isCollapsed && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/40" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / User Area */}
        <div className="p-4 bg-muted/5 border-t border-border mt-auto space-y-2">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 px-2 py-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
                <span className="text-sm font-black text-primary">
                  {userEmail?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-foreground truncate tracking-tight">{userEmail || "Admin"}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Acesso Gestor</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
                <span className="text-sm font-black text-primary">
                  {userEmail?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={onSignOut}
            className={cn(
              "w-full flex items-center rounded-2xl text-left transition-all duration-200 group font-bold",
              "text-destructive hover:bg-destructive/10",
              isCollapsed ? "justify-center p-3.5" : "gap-3 px-4 py-3.5"
            )}
            title={isCollapsed ? "Sair" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm">Encerrar Sessão</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

import { motion, AnimatePresence } from "framer-motion";
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
  Layout,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
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
      <div className="fixed top-0 left-0 right-0 h-16 bg-primary border-b border-primary/20 z-[60] flex items-center px-4 lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="ml-4 flex items-center gap-3">
          <div className="p-1.5 bg-white/10 rounded-lg">
            <img src="/logo-sine-mobile.png" alt="SINE Logo" className="h-9 w-auto object-contain" />
          </div>
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
          "fixed top-0 left-0 bottom-0 z-[60] bg-primary border-r border-primary/20 flex flex-col transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-20" : "w-[280px] lg:w-72",
          "lg:z-40"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-20 lg:h-24 flex items-center gap-3 px-6 border-b border-primary/10 bg-primary">
          {!isCollapsed && (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-white/10 rounded-xl">
                <img src="/logo-sine.png" alt="SINE Logo" className="h-10 w-auto object-contain" />
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center w-full">
               <Shield className="w-6 h-6 text-white" />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5 scrollbar-hide">
          {navigationItems.map((item) => {
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
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={cn("w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105", isActive ? "text-primary" : "text-white/40 group-hover:text-white")} />
                {!isCollapsed && (
                  <span className="text-[13px] tracking-tight">{item.name}</span>
                )}
                
                {isActive && !isCollapsed && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary/40" />
                )}
              </button>
            );
          })}
          
          <div className="pt-6 mt-6 border-t border-white/10">
            <Link 
              to="/" 
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group font-bold bg-white/10 text-white hover:bg-white/20",
                isCollapsed && "justify-center px-0"
              )}
            >
              <ExternalLink className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="text-[13px] tracking-tight">Ir para o Site</span>}
            </Link>
          </div>
        </nav>

        {/* Footer / User Area */}
        <div className="p-4 bg-primary border-t border-white/10 mt-auto space-y-2">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 px-2 py-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <span className="text-sm font-black text-white">
                  {userEmail?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-white truncate tracking-tight">{userEmail || "Admin"}</p>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Acesso Gestor</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <span className="text-sm font-black text-white">
                  {userEmail?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={onSignOut}
            className={cn(
              "w-full flex items-center rounded-xl text-left transition-all duration-200 group font-bold",
              "text-white hover:bg-white/10",
              isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
            )}
            title={isCollapsed ? "Sair" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-[13px]">Encerrar Sessão</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

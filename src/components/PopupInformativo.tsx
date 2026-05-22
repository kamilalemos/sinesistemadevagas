import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePopupStore } from '@/store/popupStorage';
import { cn } from '@/lib/utils';

export const PopupInformativo = () => {
  const { config } = usePopupStore();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Não exibir dentro da área administrativa
    if (location.pathname.startsWith('/admin')) {
      setIsOpen(false);
      return;
    }

    // Verificar se o popup está ativo e se ainda não foi visualizado nesta sessão
    if (config.ativo) {
      const visualizado = sessionStorage.getItem('popup_informativo_visualizado');
      
      if (!visualizado) {
        setIsOpen(true);
      }
    }
  }, [config.ativo, location.pathname]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('popup_informativo_visualizado', 'true');
  };

  const handleAction = () => {
    if (config.botaoLink) {
      window.open(config.botaoLink, '_blank');
    }
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && config.ativo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl bg-card rounded-[2rem] shadow-2xl overflow-hidden border border-border/50 flex flex-col"
          >
            {/* Close Button (Discreto) */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/10 hover:bg-black/20 text-foreground transition-all z-20 hover:rotate-90"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Section (1080x1080 Aspect Ratio) */}
            {config.imagemBase64 && (
              <div className="w-full aspect-square overflow-hidden bg-muted flex shrink-0">
                <img
                  src={config.imagemBase64}
                  alt={config.titulo}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content Section */}
            <div className={cn(
              "p-10 md:p-12 space-y-8 flex flex-col items-center text-center",
              !config.imagemBase64 && "pt-12"
            )}>
              <div className="space-y-3">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-black px-3 py-1 mx-auto mb-2">
                  Comunicado Oficial
                </Badge>
                <h2 className="text-2xl md:text-3xl font-heading font-black text-foreground leading-tight tracking-tight">
                  {config.titulo}
                </h2>
                <div className="w-16 h-1.5 bg-primary rounded-full mx-auto" />
              </div>

              <p className="text-muted-foreground text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium">
                {config.descricao}
              </p>

              <div className="pt-6 w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
                {config.botaoTexto && (
                  <Button
                    onClick={handleAction}
                    className="h-14 rounded-2xl font-heading font-black bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2 shadow-lg shadow-secondary/20 transition-all hover:-translate-y-1"
                  >
                    {config.botaoTexto}
                    {config.botaoLink && <ExternalLink className="w-4 h-4" />}
                  </Button>
                )}
                
                <Button
                  onClick={handleClose}
                  className={cn(
                    "h-14 rounded-2xl font-heading font-black bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-lg shadow-primary/20 transition-all hover:-translate-y-1",
                    !config.botaoTexto && "sm:col-span-2 max-w-sm mx-auto w-full"
                  )}
                >
                  <CheckCircle className="w-5 h-5" />
                  Li e entendi
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

import { Badge } from "@/components/ui/badge";

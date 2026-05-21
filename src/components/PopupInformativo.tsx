import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePopupStore } from '@/store/popupStorage';

export const PopupInformativo = ({ forcedOpen = false, onClose }: { forcedOpen?: boolean, onClose?: () => void }) => {
  const { config } = usePopupStore();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (forcedOpen) {
      setIsOpen(true);
      return;
    }

    // Não exibir dentro da área administrativa
    if (location.pathname.startsWith('/admin')) {
      setIsOpen(false);
      return;
    }

    // Verificar se o popup está ativo
    if (config.ativo) {
      // Verificar se já foi visto nesta sessão para evitar loop/incômodo
      const jaVisto = sessionStorage.getItem('popup_visto');
      if (!jaVisto) {
        setIsOpen(true);
      }
    }
  }, [config.ativo]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    } else {
      sessionStorage.setItem('popup_visto', 'true');
    }
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden border border-border"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/10 hover:bg-black/20 text-foreground transition-colors z-10"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image (if exists) */}
            {config.imagem && (
              <div className="w-full h-48 sm:h-64 overflow-hidden bg-muted">
                <img
                  src={config.imagem}
                  alt={config.titulo}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 sm:p-8 space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground leading-tight">
                  {config.titulo}
                </h2>
                <div className="w-12 h-1 bg-primary rounded-full" />
              </div>

              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {config.descricao}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {config.botaoTexto && (
                  <Button
                    onClick={handleAction}
                    className="w-full sm:flex-1 h-12 rounded-xl font-heading font-bold bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  >
                    {config.botaoTexto}
                    {config.botaoLink && <ExternalLink className="w-4 h-4" />}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="w-full sm:w-auto h-12 rounded-xl font-heading font-semibold"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

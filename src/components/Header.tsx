import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Settings, ArrowRight, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoSine from "@/assets/logo-sine.png";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Início", path: "/" },
  { label: "Vagas da Semana", path: "/vagas" },
  { label: "Feirão", path: "/feirao" },
  { label: "Como se Candidatar", path: "/candidatar" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-primary py-3 shadow-md",
        scrolled ? "py-2 border-primary/20" : "py-4 border-transparent"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="p-2 rounded-xl transition-colors bg-white/10">
            <img src={logoSine} alt="Logo SINE João Pessoa" className="h-8 md:h-9 w-auto object-contain" />
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
                location.pathname === item.path
                  ? "bg-white text-primary shadow-lg"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              {item.label}
            </Link>
          ))}
          {showInstallBtn && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleInstallClick}
              className="hidden xl:flex items-center gap-2 rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white mr-2"
            >
              <Download className="w-4 h-4" />
              Instalar App
            </Button>
          )}
          <Link
            to="/admin"
            className="p-2.5 rounded-full transition-all duration-200 text-white/70 hover:text-white hover:bg-white/10"
            title="Painel Admin"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </nav>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 lg:hidden">
          {showInstallBtn && (
            <button
              onClick={handleInstallClick}
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              title="Instalar Aplicativo"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-xl transition-colors text-white hover:bg-white/10"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[60px] bg-black/40 backdrop-blur-sm z-[-1] lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white border-b border-border overflow-hidden shadow-2xl"
            >
              <nav className="flex flex-col px-4 py-6 gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center justify-between px-5 py-4 rounded-2xl text-base font-bold transition-all",
                      location.pathname === item.path
                        ? "bg-primary/5 text-primary border border-primary/10"
                        : "text-foreground/80 hover:bg-muted"
                    )}
                  >
                    {item.label}
                    <ArrowRight className={cn("w-4 h-4 opacity-30", location.pathname === item.path && "opacity-100")} />
                  </Link>
                ))}
                <div className="h-px bg-border my-2 mx-5" />
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl text-base font-bold text-foreground/60 hover:text-primary transition-all"
                >
                  <Settings className="w-5 h-5" />
                  Painel Administrativo
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

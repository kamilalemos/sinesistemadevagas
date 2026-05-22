import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Settings, ArrowRight } from "lucide-react";
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
  const location = useLocation();

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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-white/95 backdrop-blur-md py-2 shadow-sm border-border" 
          : "bg-primary py-4 border-transparent"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-4 group">
          <div className={cn(
            "p-2 rounded-xl transition-colors",
            scrolled ? "bg-primary/5" : "bg-white/10"
          )}>
            <img src={logoSine} alt="Logo SINE João Pessoa" className="h-8 md:h-9 w-auto object-contain" />
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "font-heading font-extrabold text-sm md:text-base leading-none transition-colors",
              scrolled ? "text-primary" : "text-white"
            )}>
              João Pessoa
            </span>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest opacity-70",
              scrolled ? "text-primary/70" : "text-white/70"
            )}>
              Sine Municipal
            </span>
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
                  ? scrolled 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "bg-white text-primary shadow-lg"
                  : scrolled
                    ? "text-foreground/70 hover:text-primary hover:bg-primary/5"
                    : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className={cn("w-px h-6 mx-2", scrolled ? "bg-border" : "bg-white/20")} />
          <Link
            to="/admin"
            className={cn(
              "p-2.5 rounded-full transition-all duration-200",
              scrolled
                ? "text-primary hover:bg-primary/10"
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
            title="Painel Admin"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "lg:hidden p-2 rounded-xl transition-colors",
            scrolled ? "text-primary hover:bg-primary/5" : "text-white hover:bg-white/10"
          )}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
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

import { MapPin, Instagram, Phone, Clock, ExternalLink, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import logoSine from "@/assets/logo-sine.png";
import logoPrefeitura from "@/assets/logo-prefeitura.png";

const Footer = () => {
  const ano = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <img src={logoSine} alt="Logo SINE João Pessoa" className="h-11 w-auto" />
              <img src={logoPrefeitura} alt="Prefeitura de João Pessoa" className="h-12 w-auto bg-primary-foreground/90 rounded-md px-2 py-1" />
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
              O SINE João Pessoa conecta trabalhadores a oportunidades de emprego de forma gratuita e acessível.
            </p>
          </div>

          {/* Links rápidos */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-primary-foreground/90">
              Links Rápidos
            </h3>
            <nav className="flex flex-col gap-2">
              <Link to="/vagas" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">
                Vagas da Semana
              </Link>
              <Link to="/feirao" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">
                Feirão da Empregabilidade
              </Link>
              <Link to="/candidatar" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">
                Como se Candidatar
              </Link>
            </nav>
          </div>

          {/* Contato */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-primary-foreground/90">
              Contato
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2 text-sm text-primary-foreground/70">
                <Clock className="w-4 h-4 mt-0.5 shrink-0 text-primary-foreground/50" />
                <span>Segunda a sexta, das 8h às 14h</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary-foreground/50" />
                <span>R. João Suassuna, 49 – Varadouro, João Pessoa – PB</span>
              </div>
              <a
                href="https://wa.me/5583982131516"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0 text-primary-foreground/50" />
                (83) 98213-1516
              </a>
              <a
                href="https://www.instagram.com/sinejpoficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-4 h-4 shrink-0 text-primary-foreground/50" />
                @sinejpoficial
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-primary-foreground/50 text-xs">
            © {ano} Prefeitura de João Pessoa • SINE João Pessoa
          </p>
          <p className="text-primary-foreground/40 text-xs flex items-center gap-1">
            Desenvolvido por UMTI – Prefeitura de João Pessoa
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

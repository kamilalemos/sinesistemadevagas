import { MapPin, Instagram, Phone, Clock } from "lucide-react";
import logoSine from "@/assets/logo-sine.png";
import logoPrefeitura from "@/assets/logo-prefeitura.png";

const Footer = () => {
  const ano = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground py-8">
      <div className="container mx-auto px-4 text-center space-y-5">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <img src={logoSine} alt="Logo SINE João Pessoa" className="h-10 w-auto" />
          <img src={logoPrefeitura} alt="Prefeitura de João Pessoa" className="h-12 w-auto bg-primary-foreground/90 rounded-md px-2 py-1" />
        </div>

        <div className="flex items-center justify-center gap-1 text-primary-foreground/80 text-xs">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>Segunda a sexta, das 8h às 14h</span>
        </div>
        <div className="flex items-center justify-center gap-1 text-primary-foreground/80 text-xs">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>Av. João da Mata, 455 – Jaguaribe, João Pessoa – PB</span>
        </div>

        <div className="flex items-center justify-center gap-4 flex-wrap text-xs">
          <a
            href="https://www.instagram.com/sinejpoficial/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <Instagram className="w-4 h-4" />
            @sinejpoficial
          </a>
          <a
            href="https://wa.me/5583982131516"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <Phone className="w-4 h-4" />
            (83) 98213-1516
          </a>
        </div>

        <p className="text-primary-foreground/70 text-xs">
          Prefeitura de João Pessoa • SINE João Pessoa
        </p>
        <p className="text-primary-foreground/50 text-xs">
          Atualização semanal de vagas • {ano}
        </p>
      </div>
    </footer>
  );
};

export default Footer;

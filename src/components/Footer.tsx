import { Briefcase } from "lucide-react";

const Footer = () => {
  const ano = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground py-8">
      <div className="container mx-auto px-4 text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Briefcase className="w-5 h-5" />
          <span className="font-heading font-bold text-sm">SINE João Pessoa</span>
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

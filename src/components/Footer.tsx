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

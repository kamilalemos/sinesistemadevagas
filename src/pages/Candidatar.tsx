import { ArrowLeft, MapPin, FileText, CheckCircle, Instagram, Phone, Rocket, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const documentos = [
  "Documento com foto",
  "CPF",
  "Comprovante de residência",
  "Comprovante de escolaridade",
  "Certificados ou diplomas de cursos (se possuir)",
];

const Candidatar = () => {
  return (
    <div className="pt-14 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-primary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-heading font-bold text-lg text-foreground">Como se Candidatar</h1>
        </div>

        <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
          <div className="flex gap-3">
            <FileText className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="text-sm text-foreground leading-relaxed">
                As vagas são intermediadas pelo <strong>SINE João Pessoa</strong>.
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                Para participar é necessário comparecer presencialmente na sede do SINE com os documentos necessários.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O atendimento realiza uma entrevista inicial. Caso o candidato tenha perfil compatível com alguma vaga, será feito o encaminhamento para entrevista na empresa.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card p-5 border border-border">
          <h2 className="font-heading font-semibold text-sm mb-3 text-foreground">Documentos Necessários</h2>
          <ul className="space-y-2">
            {documentos.map((doc) => (
              <li key={doc} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                {doc}
              </li>
            ))}
          </ul>
        </div>

        {/* Endereço e contato */}
        <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
          <h2 className="font-heading font-semibold text-sm text-foreground">Endereço e Contato</h2>
          <div className="flex items-start gap-2 text-sm text-foreground">
            <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>Segunda a sexta, das 8h às 14h</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-foreground">
            <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>R. João Suassuna, 49 – Varadouro, João Pessoa – PB</span>
          </div>
          <a
            href="https://wa.me/5583982131516"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Phone className="w-4 h-4 shrink-0" />
            (83) 98213-1516
          </a>
          <a
            href="https://www.instagram.com/sinejpoficial/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Instagram className="w-4 h-4 shrink-0" />
            @sinejpoficial
          </a>
        </div>

        <a
          href="https://www.google.com/maps/place/Av.+Jo%C3%A3o+da+Mata,+455+-+Jaguaribe,+Jo%C3%A3o+Pessoa+-+PB"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="w-full rounded-xl font-heading font-semibold gap-2 mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <MapPin className="w-4 h-4" />
            Ver no Google Maps
          </Button>
        </a>

        {/* Feirão da Empregabilidade */}
        <div className="bg-accent rounded-xl shadow-card p-5 border border-border space-y-3 mt-2">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-secondary shrink-0" />
            <h2 className="font-heading font-bold text-base text-foreground">Feirão da Empregabilidade</h2>
          </div>

          <div className="space-y-2 text-sm text-foreground">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
              <span><strong>18 e 19 de março</strong></span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
              <span>Das 9h às 16h</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
              <span>Espaço Cultural José Lins do Rego</span>
            </div>
          </div>

          <div className="bg-card rounded-lg p-3 border border-border space-y-2">
            <p className="text-sm font-semibold text-foreground">💼 Dica importante:</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Para agilizar seu atendimento no dia do evento, você pode realizar ou atualizar seu cadastro no Sine até o dia <strong className="text-foreground">17 de março</strong>.
            </p>
            <div className="flex items-start gap-2 text-sm text-foreground">
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>Sine João Pessoa – Av. João Suassuna, nº 49 – Varadouro</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground italic">
            Prepare seu currículo e venha participar desse grande encontro de oportunidades!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Candidatar;

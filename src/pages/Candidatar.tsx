import { ArrowLeft, MapPin, FileText, CheckCircle } from "lucide-react";
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

        <a
          href="https://www.google.com/maps/search/SINE+João+Pessoa"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="w-full rounded-xl font-heading font-semibold gap-2 mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <MapPin className="w-4 h-4" />
            Abrir localização no Google Maps
          </Button>
        </a>
      </div>
    </div>
  );
};

export default Candidatar;

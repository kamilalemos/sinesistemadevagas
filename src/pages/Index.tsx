import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Rocket, MapPin, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedCounter from "@/components/AnimatedCounter";
import CategoryCard from "@/components/CategoryCard";
import { useVagasSemana, useVagasFeirao, useConfiguracoes, calcTotalVagas, calcCategoriasComQtd } from "@/hooks/useVagas";

const Index = () => {
  const { data: vagasSemana = [] } = useVagasSemana();
  const { data: vagasFeirao = [] } = useVagasFeirao();
  const { data: config } = useConfiguracoes();

  const totalSemana = calcTotalVagas(vagasSemana);
  const totalFeirao = calcTotalVagas(vagasFeirao);
  const categoriasComQtd = calcCategoriasComQtd(vagasSemana);
  const periodoInicio = config?.periodo_inicio ?? "";
  const periodoFim = config?.periodo_fim ?? "";

  const documentos = [
    "Documento com foto",
    "CPF",
    "Comprovante de residência",
    "Comprovante de escolaridade",
    "Certificados ou diplomas de cursos (se possuir)",
  ];

  return (
    <div className="pt-14">
      {/* Hero */}
      <section className="gradient-hero py-12 px-4">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="font-heading font-extrabold text-2xl md:text-4xl text-primary-foreground mb-2">
            Painel da Empregabilidade
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-primary-foreground/80 text-sm md:text-base mb-2">
            de João Pessoa
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-primary-foreground/60 text-xs md:text-sm">
            Atualização semanal das vagas disponíveis no SINE João Pessoa
          </motion.p>
        </div>
      </section>

      {/* Contador Principal */}
      <section className="px-4 -mt-6">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl shadow-card p-6 text-center border border-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-6 h-6 text-destructive" />
              <span className="text-muted-foreground text-sm font-medium">Vagas abertas esta semana</span>
            </div>
            <div className="text-5xl md:text-6xl font-heading font-extrabold text-primary">
              <AnimatedCounter target={totalSemana} />
            </div>
            <p className="text-muted-foreground text-xs mt-2">
              Período: {periodoInicio} a {periodoFim}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categorias */}
      <section className="px-4 py-8">
        <div className="container mx-auto">
          <h2 className="font-heading font-bold text-lg mb-4 text-foreground">Vagas por Área</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categoriasComQtd.map((cat, i) => (
              <CategoryCard key={cat.nome} nome={cat.nome} icone={cat.icone} quantidade={cat.quantidade} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Botão ver todas */}
      <section className="px-4 pb-8">
        <div className="container mx-auto">
          <Link to="/vagas">
            <Button className="w-full h-14 text-base font-heading font-bold rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
              Ver todas as vagas <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Feirão */}
      <section className="px-4 py-8 bg-accent">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card rounded-2xl shadow-card p-6 text-center border border-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Rocket className="w-6 h-6 text-secondary" />
              <h2 className="font-heading font-bold text-lg text-foreground">Feirão da Empregabilidade</h2>
            </div>
            <div className="text-4xl md:text-5xl font-heading font-extrabold text-secondary my-4">
              <AnimatedCounter target={totalFeirao} />
            </div>
            <p className="text-muted-foreground text-sm mb-4">vagas disponíveis</p>
            <Link to="/feirao">
              <Button variant="outline" className="rounded-xl font-heading font-semibold gap-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                Ver vagas do feirão <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Como se candidatar */}
      <section className="px-4 py-8">
        <div className="container mx-auto space-y-4">
          <h2 className="font-heading font-bold text-lg text-foreground">Como se Candidatar</h2>
          <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground leading-relaxed">
                As vagas são intermediadas pelo <strong>SINE João Pessoa</strong>. Para participar é necessário comparecer presencialmente na sede do SINE com os documentos necessários.
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-8">
              O atendimento realiza uma entrevista inicial. Caso o candidato tenha perfil compatível com alguma vaga, será feito o encaminhamento para entrevista na empresa.
            </p>
          </div>
          <div className="bg-card rounded-xl shadow-card p-5 border border-border">
            <h3 className="font-heading font-semibold text-sm mb-3 text-foreground">Documentos Necessários</h3>
            <ul className="space-y-2">
              {documentos.map((doc) => (
                <li key={doc} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>
          <a href="https://www.google.com/maps/search/SINE+João+Pessoa" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full rounded-xl font-heading font-semibold gap-2 mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <MapPin className="w-4 h-4" />
              Abrir localização no Google Maps
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Index;

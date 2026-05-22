import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Rocket, MapPin, FileText, CheckCircle, Clock, Phone, Instagram, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedCounter from "@/components/AnimatedCounter";
import CategoryCard from "@/components/CategoryCard";
import { useVagasLocalStore } from "@/store/vagasStorage";
import { useBannerStore } from "@/store/bannerStorage";
import { categorias as categoriasMeta } from "@/store/vagasStore";
import { VagaLocal } from "@/types";

const CandidatarSection = () => {
  const documentos = [
    "Documento com foto",
    "CPF",
    "Comprovante de residência",
    "Comprovante de escolaridade",
    "Certificados ou diplomas de cursos (se possuir)",
  ];

  return (
    <div className="space-y-4 mt-6">
      <h3 className="font-heading font-bold text-base text-foreground">Como se Candidatar</h3>
      <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
          <p className="text-sm text-foreground leading-relaxed">
            As vagas são intermediadas pelo <strong>SINE João Pessoa</strong>. Compareça presencialmente com os documentos necessários.
          </p>
        </div>
      </div>
      <div className="bg-card rounded-xl shadow-card p-5 border border-border">
        <h4 className="font-heading font-semibold text-sm mb-3 text-foreground">Documentos Necessários</h4>
        <ul className="space-y-2">
          {documentos.map((doc) => (
            <li key={doc} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
              {doc}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
        <h4 className="font-heading font-semibold text-sm text-foreground">Endereço e Contato</h4>
        <div className="flex items-start gap-2 text-sm text-foreground">
          <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <span>Segunda a sexta, das 8h às 14h</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-foreground">
          <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <span>R. João Suassuna, 49 – Varadouro, João Pessoa – PB</span>
        </div>
        <a href="https://wa.me/5583982131516" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
          <Phone className="w-4 h-4 shrink-0" />
          (83) 98213-1516
        </a>
        <a href="https://www.instagram.com/sinejpoficial/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
          <Instagram className="w-4 h-4 shrink-0" />
          @sinejpoficial
        </a>
      </div>
      <a href="https://www.google.com/maps/place/R.+Jo%C3%A3o+Suassuna,+49+-+Varadouro,+Jo%C3%A3o+Pessoa+-+PB" target="_blank" rel="noopener noreferrer">
        <Button className="w-full rounded-xl font-heading font-semibold gap-2 mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <MapPin className="w-4 h-4" />
          Ver no Google Maps
        </Button>
      </a>
    </div>
  );
};

const Index = () => {
  const { vagas_semana, vagas_feirao, semana_ativa, feirao_ativa, periodo_semana } = useVagasLocalStore();
  const { config: bannerConfig } = useBannerStore();
  const vSemana = vagas_semana.filter(v => v.publicada);
  const vFeirao = vagas_feirao.filter(v => v.publicada);

  const totalSemana = vSemana.reduce((sum, v) => sum + v.quantidade, 0);
  const totalFeirao = vFeirao.reduce((sum, v) => sum + v.quantidade, 0);

  const calcCatLocal = (vagas: VagaLocal[]) => 
    categoriasMeta.map(cat => ({
      ...cat,
      quantidade: vagas.filter(v => v.categoria === cat.nome).reduce((sum, v) => sum + v.quantidade, 0)
    }));

  const categoriasComQtdSemana = calcCatLocal(vSemana);
  const categoriasComQtdFeirao = calcCatLocal(vFeirao);
  const periodo = periodo_semana;
  const sAtiva = semana_ativa;
  const fAtiva = feirao_ativa;

  return (
    <div className="pt-14 space-y-16 pb-20">
      {/* Hero */}
      {bannerConfig.ativo && (
        <section 
          className="relative py-16 md:py-24 px-4 overflow-hidden"
          style={{
            background: bannerConfig.imagemBase64 
              ? `linear-gradient(rgba(0, 56, 147, 0.8), rgba(0, 56, 147, 0.9)), url(${bannerConfig.imagemBase64})` 
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!bannerConfig.imagemBase64 && <div className="absolute inset-0 gradient-hero -z-10" />}
          
          <div className="container mx-auto text-center relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="font-heading font-extrabold text-3xl md:text-5xl text-primary-foreground mb-4 drop-shadow-md"
            >
              {bannerConfig.titulo}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.2 }} 
              className="text-primary-foreground/90 text-lg md:text-xl mb-6 max-w-2xl mx-auto drop-shadow-sm"
            >
              {bannerConfig.descricao}
            </motion.p>
            
            {bannerConfig.textoBotao && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Link to={bannerConfig.linkBotao || "/vagas"}>
                  <Button size="lg" className="rounded-full px-8 h-12 font-heading font-bold bg-white text-primary hover:bg-white/90 shadow-lg">
                    {bannerConfig.textoBotao}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Vagas da Semana */}
      {sAtiva && (
        <>
          <section className="px-4 -mt-10 relative z-20">
            <div className="container mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-[2rem] shadow-card p-10 text-center border border-border/60">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Flame className="w-6 h-6 text-destructive" />
                  <span className="text-muted-foreground text-sm font-medium">Vagas abertas esta semana</span>
                </div>
                <div className="text-5xl md:text-6xl font-heading font-extrabold text-primary">
                  <AnimatedCounter target={totalSemana} />
                </div>
                <p className="text-muted-foreground text-xs mt-2">
                  Período: {periodo}
                </p>
              </motion.div>
            </div>
          </section>

          {/* Categorias Semana */}
          <section className="px-4 py-12">
            <div className="container mx-auto">
              <h2 className="font-heading font-bold text-lg mb-4 text-foreground">Vagas por Área</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {categoriasComQtdSemana.map((cat, i) => (
                  <CategoryCard key={cat.nome} nome={cat.nome} icone={cat.icone} quantidade={cat.quantidade} index={i} tipo="semana" />
                ))}
              </div>
            </div>
          </section>

          {/* Botão ver todas */}
          <section className="px-4 py-6">
            <div className="container mx-auto">
              <Link to="/vagas">
                <Button className="w-full h-16 text-lg font-heading font-black rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-3 shadow-xl shadow-secondary/10 transition-all hover:-translate-y-1">
                  Ver todas as vagas <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </section>

          {/* Como se Candidatar - Semana */}
          <section className="px-4 pb-8">
            <div className="container mx-auto">
              <CandidatarSection />
            </div>
          </section>
        </>
      )}

      {/* Feirão */}
      {fAtiva && (
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
            </motion.div>

            {/* Categorias Feirão */}
            <div className="mt-6">
              <h2 className="font-heading font-bold text-lg mb-4 text-foreground">Vagas por Área – Feirão</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categoriasComQtdFeirao.map((cat, i) => (
                  <CategoryCard key={cat.nome} nome={cat.nome} icone={cat.icone} quantidade={cat.quantidade} index={i} tipo="feirao" />
                ))}
              </div>
            </div>

            {/* Botão ver vagas do feirão */}
            <div className="mt-6">
              <Link to="/feirao">
                <Button className="w-full h-14 text-base font-heading font-bold rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
                  Ver todas as vagas do feirão <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Info Feirão */}
            <div className="mt-6 bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
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

              <div className="bg-accent rounded-lg p-3 border border-border space-y-2">
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

            {/* Documentos Feirão */}
            <div className="mt-6 bg-card rounded-xl shadow-card p-5 border border-border">
              <h3 className="font-heading font-semibold text-sm mb-3 text-foreground">Documentos Necessários</h3>
              <ul className="space-y-2">
                {["Documento com foto", "CPF", "Comprovante de residência", "Comprovante de escolaridade", "Certificados ou diplomas de cursos (se possuir)", "Currículo"].map((doc) => (
                  <li key={doc} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>
      )}
    </div>
  );
};

export default Index;

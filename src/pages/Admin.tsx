import { useState } from "react";
import { ArrowLeft, Upload, Lock, LogOut, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVagasStore, Vaga } from "@/store/vagasStore";
import { toast } from "sonner";

const ADMIN_PASS = "sine2026";

const Admin = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");
  const { vagasSemana, feirao, setVagasSemana, setFeirao } = useVagasStore();

  const handleLogin = () => {
    if (password === ADMIN_PASS) {
      setLoggedIn(true);
      setPeriodoInicio(vagasSemana.periodoInicio);
      setPeriodoFim(vagasSemana.periodoFim);
    } else {
      toast.error("Senha incorreta");
    }
  };

  const parsePDFText = (text: string): Vaga[] => {
    const lines = text.split("\n").filter((l) => l.trim());
    const vagas: Vaga[] = [];
    
    for (const line of lines) {
      const parts = line.split(/\t|;|,/).map((p) => p.trim());
      if (parts.length >= 4) {
        const qtd = parseInt(parts[0]);
        if (!isNaN(qtd) && qtd > 0) {
          vagas.push({
            qtd,
            cargo: parts[1] || parts[2] || "Cargo não informado",
            escolaridade: parts[2] || parts[3] || "Não informado",
            experiencia: parts[3] || parts[4] || "Não informada",
            descricao: parts[4] || parts[5] || "Sem descrição",
            categoria: detectarCategoria(parts[1] || parts[2] || ""),
          });
        }
      }
    }
    return vagas;
  };

  const detectarCategoria = (cargo: string): string => {
    const c = cargo.toLowerCase();
    if (c.includes("desenvolv") || c.includes("técnico") || c.includes("ti") || c.includes("program")) return "Tecnologia";
    if (c.includes("admin") || c.includes("recep") || c.includes("secretár") || c.includes("auxiliar admin")) return "Administrativo";
    if (c.includes("vend") || c.includes("comerci")) return "Vendas";
    if (c.includes("market") || c.includes("design") || c.includes("comunic")) return "Marketing";
    if (c.includes("motor") || c.includes("logíst") || c.includes("entrega") || c.includes("estoque")) return "Logística";
    if (c.includes("oper") || c.includes("produção") || c.includes("industr") || c.includes("soldad")) return "Indústria";
    return "Serviços";
  };

  const handleFileUpload = async (type: "semana" | "feirao") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.txt,.csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const vagas = parsePDFText(text);

      if (vagas.length === 0) {
        toast.error("Não foi possível extrair vagas do arquivo. Tente um CSV ou TXT com formato: Qtd;Cargo;Escolaridade;Experiência;Descrição");
        return;
      }

      const total = vagas.reduce((sum, v) => sum + v.qtd, 0);

      if (type === "semana") {
        setVagasSemana({
          vagas,
          totalVagas: total,
          periodoInicio,
          periodoFim,
          updatedAt: new Date().toISOString(),
        });
      } else {
        setFeirao({
          vagas,
          totalVagas: total,
          titulo: "Feirão da Empregabilidade 2026",
          updatedAt: new Date().toISOString(),
        });
      }

      toast.success(`${total} vagas importadas com sucesso!`);
    };
    input.click();
  };

  if (!loggedIn) {
    return (
      <div className="pt-14 min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-2xl shadow-card p-6 w-full max-w-sm border border-border space-y-4">
          <div className="text-center">
            <Lock className="w-10 h-10 text-primary mx-auto mb-2" />
            <h1 className="font-heading font-bold text-lg text-foreground">Painel Administrativo</h1>
            <p className="text-muted-foreground text-xs">Acesso restrito</p>
          </div>
          <Input
            type="password"
            placeholder="Senha de acesso"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="rounded-xl"
          />
          <Button onClick={handleLogin} className="w-full rounded-xl font-heading font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
            Entrar
          </Button>
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">
            ← Voltar ao site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-14 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-primary">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-heading font-bold text-lg text-foreground">Painel Admin</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setLoggedIn(false)} className="text-muted-foreground">
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </Button>
        </div>

        {/* Período */}
        <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary" />
            <h2 className="font-heading font-semibold text-sm text-foreground">Período das Vagas</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Início</label>
              <Input
                value={periodoInicio}
                onChange={(e) => setPeriodoInicio(e.target.value)}
                placeholder="dd/mm/aaaa"
                className="rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Fim</label>
              <Input
                value={periodoFim}
                onChange={(e) => setPeriodoFim(e.target.value)}
                placeholder="dd/mm/aaaa"
                className="rounded-lg text-sm"
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setVagasSemana({ ...vagasSemana, periodoInicio, periodoFim });
              toast.success("Período atualizado!");
            }}
            className="rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 font-heading text-xs"
          >
            Atualizar período
          </Button>
        </div>

        {/* Upload Semana */}
        <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
          <h2 className="font-heading font-semibold text-sm text-foreground">Vagas da Semana</h2>
          <p className="text-xs text-muted-foreground">
            Atual: {vagasSemana.totalVagas} vagas • {vagasSemana.vagas.length} cargos
          </p>
          <Button
            onClick={() => handleFileUpload("semana")}
            className="w-full rounded-xl font-heading font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="w-4 h-4" />
            Upload arquivo de vagas
          </Button>
          <p className="text-xs text-muted-foreground">Formatos: CSV ou TXT separado por ; ou tab</p>
        </div>

        {/* Upload Feirão */}
        <div className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
          <h2 className="font-heading font-semibold text-sm text-foreground">Feirão da Empregabilidade</h2>
          <p className="text-xs text-muted-foreground">
            Atual: {feirao.totalVagas} vagas • {feirao.vagas.length} cargos
          </p>
          <Button
            onClick={() => handleFileUpload("feirao")}
            className="w-full rounded-xl font-heading font-semibold gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            <Upload className="w-4 h-4" />
            Upload arquivo do feirão
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Admin;

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Save, Eraser } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useVagasLocalStore } from "@/store/vagasStorage";
import {
  parseISODate,
  toISODate,
  formatPeriodoAuto,
  validarDatasPeriodo,
  resolvePeriodoLabel,
} from "@/lib/periodoNome";

interface Props {
  tipo: "semana" | "feirao";
}

function DatePicker({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string | null;
  onChange: (iso: string | null) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const date = parseISODate(value);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-12 rounded-xl justify-start text-left font-semibold bg-muted/20 border-border/50 w-full",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
          {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date ?? undefined}
          onSelect={(d) => onChange(d ? toISODate(d) : null)}
          initialFocus
          locale={ptBR}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

export function PeriodoCard({ tipo }: Props) {
  const store = useVagasLocalStore();
  const inicioAtual = tipo === "semana" ? store.data_inicio_semana : store.data_inicio_feirao;
  const fimAtual = tipo === "semana" ? store.data_fim_semana : store.data_fim_feirao;
  const nomeAtual = tipo === "semana" ? store.nome_semana : store.nome_feirao;
  const labelAtual = tipo === "semana" ? store.periodo_semana : store.periodo_feirao;

  const [inicio, setInicio] = useState<string | null>(inicioAtual);
  const [fim, setFim] = useState<string | null>(fimAtual);
  const [nome, setNome] = useState<string>(nomeAtual ?? "");

  useEffect(() => setInicio(inicioAtual), [inicioAtual]);
  useEffect(() => setFim(fimAtual), [fimAtual]);
  useEffect(() => setNome(nomeAtual ?? ""), [nomeAtual]);

  // Estado do dialog "Criar Novo Período"
  const [novoOpen, setNovoOpen] = useState(false);
  const [novoInicio, setNovoInicio] = useState<string | null>(null);
  const [novoFim, setNovoFim] = useState<string | null>(null);
  const [novoNome, setNovoNome] = useState("");

  const previewNome = resolvePeriodoLabel(nome, inicio, fim);
  const previewNomeNovo = resolvePeriodoLabel(novoNome, novoInicio, novoFim);

  const salvar = () => {
    const erro = validarDatasPeriodo(inicio, fim);
    if (erro) {
      toast.error(erro);
      return;
    }
    const label = resolvePeriodoLabel(nome, inicio, fim);
    store.setDatasPeriodo(tipo, inicio, fim, nome.trim() ? nome.trim() : null);
    // garante que o rótulo público reflita a auto-geração quando nome estiver vazio
    if (!nome.trim()) store.setPeriodo(tipo, label);
    toast.success("Datas do período salvas!");
  };

  const criarNovoPeriodo = () => {
    const erro = validarDatasPeriodo(novoInicio, novoFim);
    if (erro) {
      toast.error(erro);
      return;
    }
    const label = resolvePeriodoLabel(novoNome, novoInicio, novoFim);
    store.resetVagas(tipo, label, {
      inicio: novoInicio,
      fim: novoFim,
      nome: novoNome.trim() ? novoNome.trim() : null,
    });
    toast.success("Novo período criado. Período anterior arquivado no histórico.");
    setNovoOpen(false);
    setNovoInicio(null);
    setNovoFim(null);
    setNovoNome("");
  };

  return (
    <div className="bg-card rounded-[1.5rem] p-8 md:p-10 border border-border shadow-card space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading font-extrabold text-lg text-foreground tracking-tight">Período das Vagas</h3>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Defina a validade oficial das vagas por data
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
            📅 Data Inicial
          </Label>
          <DatePicker value={inicio} onChange={setInicio} placeholder="Selecione a data inicial" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
            📅 Data Final
          </Label>
          <DatePicker value={fim} onChange={setFim} placeholder="Selecione a data final" />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Nome do Período (opcional)
          </Label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={formatPeriodoAuto(inicio, fim) || "Ex: Feirão de Julho"}
            className="rounded-xl h-12 bg-muted/20 border-border/50"
          />
          {previewNome && (
            <p className="text-xs text-muted-foreground pl-1">
              Rótulo exibido: <span className="font-bold text-foreground">{previewNome}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="secondary"
          onClick={salvar}
          className="rounded-xl h-12 px-8 font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Datas
        </Button>

        <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="rounded-xl h-12 px-6 font-bold text-primary hover:bg-primary/5 border-primary/30"
            >
              <Eraser className="w-4 h-4 mr-2" />
              Criar Novo Período
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-heading">Criar novo período</DialogTitle>
              <DialogDescription>
                O período atual{labelAtual ? ` (${labelAtual})` : ""} será arquivado no histórico com todas as vagas
                atuais. O novo período iniciará vazio.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Data Inicial
                  </Label>
                  <DatePicker value={novoInicio} onChange={setNovoInicio} placeholder="Data inicial" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Data Final
                  </Label>
                  <DatePicker value={novoFim} onChange={setNovoFim} placeholder="Data final" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Nome (opcional)
                </Label>
                <Input
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder={formatPeriodoAuto(novoInicio, novoFim) || "Deixe vazio para gerar automaticamente"}
                  className="rounded-xl h-12 bg-muted/20"
                />
                {previewNomeNovo && (
                  <p className="text-xs text-muted-foreground">
                    Rótulo: <span className="font-bold text-foreground">{previewNomeNovo}</span>
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setNovoOpen(false)} className="rounded-xl font-bold">
                Cancelar
              </Button>
              <Button onClick={criarNovoPeriodo} className="rounded-xl font-bold">
                Arquivar e Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

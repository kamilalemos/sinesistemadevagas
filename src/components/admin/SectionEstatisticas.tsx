import { BarChart3, TrendingUp, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VagaDB, calcTotalVagas, calcCategoriasComQtd } from "@/hooks/useVagas";

interface HistoricoEntry {
  id: string;
  mes: number;
  ano: number;
  tipo: string;
  total_vagas: number;
  total_cargos: number;
  categorias: Record<string, number>;
}

const MESES = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface Props {
  vagasSemana: VagaDB[];
  vagasFeirao: VagaDB[];
  historico: HistoricoEntry[];
  statsAno: number;
  setStatsAno: (ano: number) => void;
  onSalvarEstatistica: () => void;
}

export function SectionEstatisticas({ vagasSemana, vagasFeirao, historico, statsAno, setStatsAno, onSalvarEstatistica }: Props) {
  const maxVagas = Math.max(...historico.map((h) => h.total_vagas), 1);
  const totalSemana = calcTotalVagas(vagasSemana);
  const totalFeirao = calcTotalVagas(vagasFeirao);

  return (
    <div id="section-estatisticas" className="bg-card rounded-xl shadow-card p-5 border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-semibold text-sm text-foreground">Estatísticas de Vagas</h2>
        </div>
        <Button size="sm" variant="outline" onClick={onSalvarEstatistica} className="rounded-lg text-xs gap-1">
          <Save className="w-3 h-3" /> Salvar mês atual
        </Button>
      </div>

      {/* Resumo atual */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-accent/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-heading font-bold text-primary">{totalSemana}</p>
          <p className="text-xs text-muted-foreground">Semana</p>
        </div>
        <div className="bg-accent/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-heading font-bold text-secondary">{totalFeirao}</p>
          <p className="text-xs text-muted-foreground">Feirão</p>
        </div>
        <div className="bg-accent/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-heading font-bold text-foreground">{totalSemana + totalFeirao}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>

      {/* Categorias atuais */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">VAGAS POR CATEGORIA (ATUAL)</p>
        <div className="space-y-1.5">
          {calcCategoriasComQtd(vagasSemana).filter(c => c.quantidade > 0).sort((a, b) => b.quantidade - a.quantidade).map((cat) => (
            <div key={cat.nome} className="flex items-center gap-2">
              <span className="text-xs text-foreground w-24 truncate">{cat.nome}</span>
              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${(cat.quantidade / totalSemana) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground w-10 text-right">{cat.quantidade}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico anual */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> HISTÓRICO MENSAL
          </p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setStatsAno(statsAno - 1)}>←</Button>
            <span className="text-xs font-heading font-bold text-foreground">{statsAno}</span>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setStatsAno(statsAno + 1)}>→</Button>
          </div>
        </div>

        {historico.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Nenhuma estatística salva para {statsAno}. Clique em "Salvar mês atual" para registrar.
          </p>
        ) : (
          <>
            <div className="flex items-end gap-1 h-32">
              {Array.from({ length: 12 }, (_, i) => {
                const entry = historico.find((h) => h.mes === i + 1);
                const height = entry ? (entry.total_vagas / maxVagas) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-muted-foreground">{entry?.total_vagas || ""}</span>
                    <div
                      className="w-full rounded-t bg-primary/80 transition-all min-h-[2px]"
                      style={{ height: `${Math.max(height, entry ? 4 : 0)}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground">{MESES[i + 1]}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Total no ano</p>
                <p className="text-lg font-heading font-bold text-foreground">
                  {historico.reduce((sum, h) => sum + h.total_vagas, 0).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Média mensal</p>
                <p className="text-lg font-heading font-bold text-foreground">
                  {historico.length > 0 ? Math.round(historico.reduce((sum, h) => sum + h.total_vagas, 0) / historico.length).toLocaleString() : 0}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { History, Search, ChevronDown, ChevronUp, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getHistory } from "@/lib/vagasPersistence";

export const HistoricoPage = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-bold text-2xl text-foreground">Histórico Mensal</h1>
        <p className="text-muted-foreground">Consulte backups automáticos e vagas de meses anteriores.</p>
      </div>

      <div className="grid gap-4">
        {history.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center space-y-3">
            <History className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground text-sm">Nenhum backup mensal gerado ainda.</p>
            <p className="text-xs text-muted-foreground/60">Os backups são criados automaticamente durante a 4ª semana do mês.</p>
          </div>
        ) : (
          history.map((item, idx) => {
            const id = `${item.year}_${item.month}`;
            const isExpanded = expandedId === id;
            
            // Count total vagas in backup
            const totalVagas = 
              (item.weeks?.semana_1?.vagas?.length || 0) +
              (item.weeks?.semana_2?.vagas?.length || 0) +
              (item.weeks?.semana_3?.vagas?.length || 0) +
              (item.weeks?.semana_4?.vagas?.length || 0) +
              (item.feirao?.vagas?.length || 0);

            return (
              <div key={id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-all hover:border-primary/30">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleExpand(id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-foreground">
                        {item.month}/{item.year}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">Consolidado em: {new Date(item.consolidatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-medium">{totalVagas} vagas no total</Badge>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4 bg-muted/10 space-y-4 animate-accordion-down">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                      {[1, 2, 3, 4].map(w => {
                        const weekVagas = item.weeks[`semana_${w}`]?.vagas || [];
                        return (
                          <div key={w} className="bg-background border border-border rounded-lg p-3 space-y-1">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Semana {w}</p>
                            <p className="text-sm font-semibold">{weekVagas.length} vagas</p>
                          </div>
                        );
                      })}
                      <div className="bg-background border border-border rounded-lg p-3 space-y-1">
                        <p className="text-[10px] font-bold uppercase text-primary">Feirão</p>
                        <p className="text-sm font-semibold">{(item.feirao?.vagas || []).length} vagas</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase px-1">Visualização Rápida (Vagas Publicadas)</h4>
                      <div className="max-h-60 overflow-y-auto border border-border rounded-lg bg-background">
                        <table className="w-full text-left text-[11px]">
                          <thead className="sticky top-0 bg-muted/50 border-b border-border">
                            <tr>
                              <th className="p-2 font-bold">Descrição</th>
                              <th className="p-2 font-bold">Categoria</th>
                              <th className="p-2 font-bold">Semana</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {[1, 2, 3, 4].map(w => (
                              (item.weeks[`semana_${w}`]?.vagas || []).map((v: any) => (
                                <tr key={v.id} className="hover:bg-muted/30">
                                  <td className="p-2">{v.descricao}</td>
                                  <td className="p-2 font-medium">{v.categoria}</td>
                                  <td className="p-2">Semana {w}</td>
                                </tr>
                              ))
                            ))}
                            {(item.feirao?.vagas || []).map((v: any) => (
                               <tr key={v.id} className="hover:bg-muted/30">
                                  <td className="p-2">{v.descricao}</td>
                                  <td className="p-2 font-medium text-primary">{v.categoria}</td>
                                  <td className="p-2 text-primary font-bold">Feirão</td>
                                </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

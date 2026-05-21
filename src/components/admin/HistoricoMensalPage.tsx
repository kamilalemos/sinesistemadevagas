import { useVagasLocalStore, BackupMensal } from "@/store/vagasStorage";
import { History, Calendar, FileDown, Eye, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const HistoricoMensalPage = () => {
  const { getHistórico } = useVagasLocalStore();
  const historico = getHistórico();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getMonthName = (monthStr: string) => {
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return months[parseInt(monthStr) - 1];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-heading font-bold text-foreground">Histórico Mensal</h1>
        <p className="text-muted-foreground text-sm">Consulte backups e vagas de meses anteriores.</p>
      </div>

      {historico.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <History className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-lg text-foreground">Nenhum histórico encontrado</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Os backups automáticos serão criados na última semana de cada mês.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {historico.map((backup) => {
            const id = `${backup.ano}-${backup.mes}`;
            const isExpanded = expandedId === id;
            const totalVagas = Object.values(backup.vagas_semanas).reduce((acc, current) => acc + current.length, 0) + backup.vagas_feirao.length;

            return (
              <div key={id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-all hover:border-primary/30">
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-foreground">
                        {getMonthName(backup.mes)} / {backup.ano}
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        Backup criado em {new Date(backup.data_backup).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="font-medium bg-secondary/50">
                      {totalVagas} vagas no total
                    </Badge>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 border-t border-border bg-muted/10 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {[1, 2, 3, 4].map(s => (
                        <div key={s} className="bg-card p-4 rounded-lg border border-border shadow-sm">
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1 tracking-wider">Semana {s}</p>
                          <p className="text-xl font-heading font-bold text-foreground">
                            {backup.vagas_semanas[`semana_${s}`]?.length || 0}
                          </p>
                          <p className="text-[10px] text-muted-foreground">vagas cadastradas</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-foreground">Detalhamento das Vagas</h4>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 rounded-lg">
                          <FileDown className="w-3.5 h-3.5" /> Exportar CSV
                        </Button>
                      </div>

                      <ScrollArea className="h-64 rounded-lg border border-border bg-card">
                        <div className="p-4 space-y-4">
                          {Object.entries(backup.vagas_semanas).map(([sem, vagas]) => (
                            <div key={sem} className="space-y-2">
                              <h5 className="text-[11px] font-bold text-primary uppercase tracking-widest">{sem.replace('_', ' ')}</h5>
                              {vagas.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic px-2">Sem vagas nesta semana.</p>
                              ) : (
                                <div className="space-y-1">
                                  {vagas.map(v => (
                                    <div key={v.id} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-md border border-border/40 text-xs">
                                      <span className="font-medium">{v.descricao}</span>
                                      <span className="text-muted-foreground">{v.empresa || "N/A"}</span>
                                      <Badge variant="outline" className="text-[10px] py-0">{v.quantidade} vag.</Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          
                          <div className="space-y-2 mt-4">
                            <h5 className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Feirão do Emprego</h5>
                            {backup.vagas_feirao.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic px-2">Sem vagas no feirão.</p>
                            ) : (
                              <div className="space-y-1">
                                {backup.vagas_feirao.map(v => (
                                  <div key={v.id} className="flex items-center justify-between py-2 px-3 bg-emerald-500/5 rounded-md border border-emerald-500/10 text-xs">
                                    <span className="font-medium">{v.descricao}</span>
                                    <span className="text-muted-foreground">{v.empresa || "N/A"}</span>
                                    <Badge variant="outline" className="text-[10px] py-0 border-emerald-200 text-emerald-700">{v.quantidade} vag.</Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

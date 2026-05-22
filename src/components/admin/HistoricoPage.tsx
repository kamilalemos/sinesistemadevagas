import { useState, useEffect, useMemo } from "react";
import { History, ChevronDown, ChevronUp, Calendar, Search, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getHistory } from "@/lib/vagasPersistence";
import { HistoricoMensal, VagaLocal } from "@/types";
import { cn } from "@/lib/utils";

export const HistoricoPage = () => {
  const [history, setHistory] = useState<HistoricoMensal[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return history;

    const term = searchTerm.toLowerCase();
    
    return history.map(item => {
      // Create a deep copy to filter within
      const newItem = { ...item, weeks: { ...item.weeks } };
      
      let hasMatch = false;

      // Filter each week
      (Object.keys(newItem.weeks) as Array<keyof typeof newItem.weeks>).forEach(weekKey => {
        const weekData = newItem.weeks[weekKey];
        const filteredVagas = weekData.vagas.filter(v => 
          v.publicada && (
            v.descricao.toLowerCase().includes(term) || 
            v.categoria.toLowerCase().includes(term) ||
            v.cbo?.toLowerCase().includes(term)
          )
        );
        
        newItem.weeks[weekKey] = { ...weekData, vagas: filteredVagas };
        if (filteredVagas.length > 0) hasMatch = true;
      });

      // Filter feirao
      const filteredFeiraoVagas = newItem.feirao.vagas.filter(v => 
        v.publicada && (
          v.descricao.toLowerCase().includes(term) || 
          v.categoria.toLowerCase().includes(term) ||
          v.cbo?.toLowerCase().includes(term)
        )
      );
      
      newItem.feirao = { ...newItem.feirao, vagas: filteredFeiraoVagas };
      if (filteredFeiraoVagas.length > 0) hasMatch = true;

      return hasMatch ? newItem : null;
    }).filter((item): item is HistoricoMensal => item !== null);
  }, [history, searchTerm]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm shadow-primary/5">
              <History className="w-6 h-6" />
            </div>
            <h1 className="font-heading font-black text-3xl text-foreground tracking-tight">Histórico Mensal</h1>
          </div>
          <p className="text-muted-foreground font-medium pl-1">Consulte backups automáticos e vagas publicadas de meses anteriores.</p>
        </div>

        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar por cargo ou categoria..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 rounded-2xl bg-card border-border shadow-sm focus:ring-primary/10 transition-all text-base font-medium"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredHistory.length === 0 ? (
          <div className="bg-card border border-border/60 rounded-[2.5rem] p-16 md:p-24 text-center space-y-4 shadow-card">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-2">
              <History className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <p className="text-foreground font-black text-xl">Nenhum registro encontrado</p>
              <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                {searchTerm 
                  ? "Tente buscar por outro termo ou limpe o filtro atual." 
                  : "Os backups são criados automaticamente durante a 4ª semana do mês."}
              </p>
            </div>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const id = `${item.year}_${item.month}`;
            const isExpanded = expandedId === id || searchTerm !== ""; // Auto-expand when searching
            
            // Count only published vagas for the totals
            const totalVagas = 
              (item.weeks?.semana_1?.vagas?.filter(v => v.publicada).length || 0) +
              (item.weeks?.semana_2?.vagas?.filter(v => v.publicada).length || 0) +
              (item.weeks?.semana_3?.vagas?.filter(v => v.publicada).length || 0) +
              (item.weeks?.semana_4?.vagas?.filter(v => v.publicada).length || 0) +
              (item.feirao?.vagas?.filter(v => v.publicada).length || 0);

            if (totalVagas === 0 && searchTerm) return null;

            return (
              <div key={id} className={cn(
                "bg-card border border-border/60 rounded-[2rem] overflow-hidden transition-all duration-300",
                isExpanded ? "shadow-xl ring-1 ring-primary/5" : "shadow-card hover:border-primary/30 hover:shadow-lg"
              )}>
                <div 
                  className={cn(
                    "p-6 md:p-8 flex items-center justify-between cursor-pointer transition-colors",
                    isExpanded ? "bg-muted/5" : "hover:bg-muted/30"
                  )}
                  onClick={() => toggleExpand(id)}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                      <Calendar className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-xl text-foreground tracking-tight">
                        {item.month}/{item.year}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest border-primary/20 text-primary/70 py-0.5">
                          Backup Mensal
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Consolidado: {new Date(item.consolidatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="font-black text-sm px-4 py-1.5 rounded-xl bg-primary/5 text-primary border-primary/10">
                      {totalVagas} {totalVagas === 1 ? 'vaga publicada' : 'vagas publicadas'}
                    </Badge>
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 bg-muted/50",
                      isExpanded && "rotate-180 bg-primary text-white"
                    )}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border/60 p-8 space-y-10 animate-fade-in bg-white/50">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      {[1, 2, 3, 4].map(w => {
                        const weekKey = `semana_${w}` as keyof typeof item.weeks;
                        const weekVagas = item.weeks[weekKey]?.vagas?.filter(v => v.publicada) || [];
                        return (
                          <div key={w} className="bg-card border border-border/50 rounded-2xl p-5 space-y-2 shadow-sm transition-all hover:translate-y-[-2px]">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Semana {w}</p>
                            <p className="text-2xl font-black text-foreground">{weekVagas.length}</p>
                          </div>
                        );
                      })}
                      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-2 shadow-sm col-span-2 lg:col-span-1 transition-all hover:translate-y-[-2px]">
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">Feirão Sine</p>
                        <p className="text-2xl font-black text-primary">{(item.feirao?.vagas?.filter(v => v.publicada) || []).length}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-1">
                        <FileText className="w-4 h-4 text-primary" />
                        <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Listagem Detalhada</h4>
                      </div>
                      <div className="max-h-96 overflow-y-auto border border-border/60 rounded-[1.5rem] bg-card shadow-inner scrollbar-hide">
                        <table className="w-full text-left">
                          <thead className="sticky top-0 bg-muted/80 backdrop-blur-md border-b border-border/60 z-10">
                            <tr>
                              <th className="py-4 px-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Descrição do Cargo</th>
                              <th className="py-4 px-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Categoria</th>
                              <th className="py-4 px-6 text-right font-black uppercase tracking-widest text-[10px] text-muted-foreground">Origem</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {[1, 2, 3, 4].map(w => {
                              const weekKey = `semana_${w}` as keyof typeof item.weeks;
                              return (item.weeks[weekKey]?.vagas || [])
                                .filter(v => v.publicada)
                                .map((v: VagaLocal) => (
                                  <tr key={`${id}-w${w}-${v.id}`} className="hover:bg-primary/[0.02] transition-colors group">
                                    <td className="py-5 px-6 font-black text-foreground group-hover:text-primary transition-colors text-sm">{v.descricao}</td>
                                    <td className="py-5 px-4">
                                      <Badge variant="secondary" className="bg-muted/50 text-muted-foreground border-transparent text-[9px] uppercase font-bold tracking-wider">
                                        {v.categoria}
                                      </Badge>
                                    </td>
                                    <td className="py-5 px-6 text-right font-bold text-muted-foreground/60 text-[11px] uppercase tracking-tighter italic">Semana {w}</td>
                                  </tr>
                                ));
                            })}
                            {(item.feirao?.vagas || [])
                              .filter(v => v.publicada)
                              .map((v: VagaLocal) => (
                               <tr key={`${id}-f-${v.id}`} className="hover:bg-primary/[0.03] transition-colors group bg-primary/[0.01]">
                                  <td className="py-5 px-6 font-black text-primary transition-colors text-sm">{v.descricao}</td>
                                  <td className="py-5 px-4">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-transparent text-[9px] uppercase font-bold tracking-wider">
                                      {v.categoria}
                                    </Badge>
                                  </td>
                                  <td className="py-5 px-6 text-right font-black text-primary/50 text-[11px] uppercase tracking-widest">Feirão</td>
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

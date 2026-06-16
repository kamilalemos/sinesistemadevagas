import { useState, useEffect, useMemo } from "react";
import { 
  History, 
  ChevronDown, 
  Calendar, 
  Search, 
  FileText, 
  Eye, 
  FileSpreadsheet, 
  FileJson 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getHistory } from "@/lib/vagasPersistence";
import { HistoricoMensal, VagaLocal } from "@/types";
import { cn } from "@/lib/utils";
import { exportToCSV, exportToJSON } from "@/lib/exportUtils";
import { Pagination } from "@/components/ui/pagination-custom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";

export const HistoricoPage = () => {
  const [history, setHistory] = useState<HistoricoMensal[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedVagas, setSelectedVagas] = useState<VagaLocal[]>([]);
  const [viewTitle, setViewTitle] = useState("");
  
  const itemsPerPage = 12;

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return history;
    const term = searchTerm.toLowerCase();
    
    return history.filter(item => {
      const monthStr = String(item.month).toLowerCase();
      const yearStr = String(item.year);
      return monthStr.includes(term) || yearStr.includes(term);
    });
  }, [history, searchTerm]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const currentHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistory, currentPage]);

  const handleViewVagas = (vagas: VagaLocal[], title: string) => {
    const publishedOnly = vagas.filter(v => v.publicada);
    setSelectedVagas(publishedOnly);
    setViewTitle(title);
    setIsPreviewOpen(true);
  };

  const handleExport = (vagas: VagaLocal[], type: 'csv' | 'json', title: string) => {
    const publishedOnly = vagas.filter(v => v.publicada);
    const filename = `sine-historico-${title.toLowerCase().replace(/\s+/g, '-')}`;

    if (type === 'csv') exportToCSV(publishedOnly, filename);
    else if (type === 'json') exportToJSON(publishedOnly, filename);
  };

  const getWeekRange = (weekNum: number, month: string | number, year: number | string) => {
    const ranges: Record<number, string> = {
      1: "01 a 08",
      2: "09 a 15",
      3: "18 a 22",
      4: "23 a 31"
    };
    return `${ranges[weekNum]} de ${month}/${year}`;
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm shadow-primary/5">
              <History className="w-6 h-6" />
            </div>
            <h1 className="font-heading font-black text-3xl text-foreground tracking-tight">Histórico Mensal</h1>
          </div>
          <p className="text-muted-foreground font-medium pl-1">Acesse backups e relatórios simplificados de períodos anteriores.</p>
        </div>

        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Filtrar por mês ou ano..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 rounded-2xl bg-card border-border shadow-sm focus:ring-primary/10 transition-all text-base font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {currentHistory.length === 0 ? (
          <div className="bg-card border border-border/60 rounded-[2.5rem] p-16 md:p-24 text-center space-y-4 shadow-card">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-2">
              <History className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <p className="text-foreground font-black text-xl">Nenhum registro encontrado</p>
          </div>
        ) : (
          currentHistory.map((item) => {
            const id = `${item.year}_${item.month}`;
            const isExpanded = expandedId === id;
            
            return (
              <div key={id} className={cn(
                "bg-card border border-border/60 rounded-[2rem] overflow-hidden transition-all duration-300 shadow-card",
                isExpanded && "ring-2 ring-primary/10 shadow-xl"
              )}>
                <div 
                  className={cn(
                    "p-6 md:p-8 flex items-center justify-between cursor-pointer transition-colors",
                    isExpanded ? "bg-muted/10" : "hover:bg-muted/30"
                  )}
                  onClick={() => toggleExpand(id)}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                      <Calendar className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-2xl text-foreground tracking-tight">
                        {item.month} / {item.year}
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Consolidado em {new Date(item.consolidatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-muted/50",
                    isExpanded && "rotate-180 bg-primary text-white"
                  )}>
                    <ChevronDown className="w-6 h-6" />
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4].map(w => {
                        const weekKey = `semana_${w}` as keyof typeof item.weeks;
                        const weekVagas = item.weeks[weekKey]?.vagas || [];
                        const count = weekVagas.filter(v => v.publicada).length;
                        const title = `Semana ${w} - ${getWeekRange(w, item.month, item.year)}`;
                        
                        return (
                          <div key={w} className="bg-muted/20 border border-border/40 rounded-3xl p-6 space-y-4 hover:bg-muted/30 transition-colors group">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-primary tracking-widest">Semana {w}</p>
                                <p className="text-xs font-bold text-muted-foreground">{getWeekRange(w, item.month, item.year)}</p>
                              </div>
                              <Badge className="bg-primary/10 text-primary border-transparent font-black">{count} Vagas</Badge>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 rounded-xl h-10 font-bold gap-2 bg-white/50"
                                onClick={() => handleViewVagas(weekVagas, title)}
                              >
                                <Eye className="w-4 h-4" /> Visualizar
                              </Button>
                              <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="rounded-lg h-10 w-10 text-red-500 hover:bg-red-50" onClick={() => handleExport(weekVagas, 'pdf', title)} title="PDF">
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="rounded-lg h-10 w-10 text-emerald-500 hover:bg-emerald-50" onClick={() => handleExport(weekVagas, 'csv', title)} title="CSV">
                                  <FileSpreadsheet className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="rounded-lg h-10 w-10 text-amber-500 hover:bg-amber-50" onClick={() => handleExport(weekVagas, 'json', title)} title="JSON">
                                  <FileJson className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Feirão Card */}
                      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 space-y-4 hover:bg-primary/10 transition-colors lg:col-span-2">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-primary tracking-widest">Ação Especial</p>
                            <h4 className="font-heading font-black text-xl text-primary">Feirão da Empregabilidade</h4>
                          </div>
                          <Badge className="bg-primary text-white font-black">{(item.feirao?.vagas?.filter(v => v.publicada).length || 0)} Vagas</Badge>
                        </div>

                        <div className="flex items-center gap-2">
                           <Button 
                            variant="default" 
                            size="sm" 
                            className="flex-1 rounded-xl h-10 font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
                            onClick={() => handleViewVagas(item.feirao?.vagas || [], `Feirão da Empregabilidade - ${item.month}/${item.year}`)}
                          >
                            <Eye className="w-4 h-4" /> Abrir Listagem
                          </Button>
                          <div className="flex gap-2">
                            <Button variant="outline" className="rounded-xl h-10 bg-white border-primary/20 text-primary hover:bg-primary/5 px-4 font-bold" onClick={() => handleExport(item.feirao?.vagas || [], 'pdf', `Feirão - ${item.month}/${item.year}`)}>PDF</Button>
                            <Button variant="outline" className="rounded-xl h-10 bg-white border-primary/20 text-primary hover:bg-primary/5 px-4 font-bold" onClick={() => handleExport(item.feirao?.vagas || [], 'csv', `Feirão - ${item.month}/${item.year}`)}>CSV</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />

      {/* Vagas List Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-[2rem] border-none shadow-2xl">
          <DialogHeader className="p-8 border-b bg-muted/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="font-heading font-black text-2xl tracking-tight text-foreground">{viewTitle}</DialogTitle>
                <DialogDescription className="font-medium text-muted-foreground">Listagem de oportunidades publicadas neste período.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            {selectedVagas.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-muted-foreground font-bold">Nenhuma vaga publicada neste período.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedVagas.map((v) => (
                  <div key={v.id} className="p-5 border border-border/60 rounded-2xl bg-card hover:border-primary/30 transition-all group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-primary/50 uppercase tracking-tighter">ID: {v.codigo}</span>
                          <Badge variant="secondary" className="text-[9px] h-4 uppercase font-bold py-0">{v.categoria}</Badge>
                        </div>
                        <h5 className="font-heading font-black text-lg text-foreground group-hover:text-primary transition-colors leading-tight">{v.descricao}</h5>
                        <p className="text-xs font-bold text-muted-foreground">{v.empresa} • {v.quantidade} {v.quantidade === 1 ? 'vaga' : 'vagas'}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-black text-foreground">{v.salario}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{v.escolaridade}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="p-6 border-t bg-muted/20 flex gap-3">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="rounded-xl font-bold px-8">Fechar</Button>
            <Button className="rounded-xl font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/20" onClick={() => handleExport(selectedVagas, 'pdf', viewTitle)}>Exportar PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

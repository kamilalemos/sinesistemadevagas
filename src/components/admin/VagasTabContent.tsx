import { useState, useEffect, useMemo } from "react";
import { PlusCircle, Trash2, Edit, Save, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useVagasLocalStore, VagaLocal } from "@/store/vagasStorage";
import { categorias } from "@/store/vagasStore";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination-custom";

interface Props {
  tipo: "semana" | "feirao";
}

export const VagasTabContent = ({ tipo }: Props) => {
  const { vagas_semana, vagas_feirao, addVaga, updateVaga, deleteVaga, periodo_semana, periodo_feirao, setPeriodo, refreshFromStorage } = useVagasLocalStore();
  
  useEffect(() => {
    refreshFromStorage();
  }, [refreshFromStorage]);

  const vagas = tipo === "semana" ? vagas_semana : vagas_feirao;
  const periodo = tipo === "semana" ? periodo_semana : periodo_feirao;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(vagas.length / itemsPerPage);
  
  const currentVagas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return vagas.slice(startIndex, startIndex + itemsPerPage);
  }, [vagas, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const [formData, setFormData] = useState({
    quantidade: 1,
    cbo: "",
    descricao: "",
    escolaridade: "Não informado",
    experiencia: "Não informada",
    codigo: "",
    beneficios: "",
    salario: "",
    empresa: "",
    categoria: "Serviços",
    periodo: periodo || "",
    publicada: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao) {
      toast.error("O campo Descrição da vaga é obrigatório");
      return;
    }
    if (editingId) {
      updateVaga(tipo, editingId, formData);
      toast.success("Vaga atualizada com sucesso!");
    } else {
      addVaga(tipo, formData);
      toast.success("Vaga cadastrada com sucesso!");
    }
    setEditingId(null);
    setFormData({
      quantidade: 1, cbo: "", descricao: "", escolaridade: "Não informado",
      experiencia: "Não informada", codigo: "", beneficios: "", salario: "",
      empresa: "", categoria: "Serviços", periodo: periodo || "", publicada: true,
    });
  };

  const handleEdit = (vaga: VagaLocal) => {
    setFormData({
      quantidade: vaga.quantidade, cbo: vaga.cbo, descricao: vaga.descricao,
      escolaridade: vaga.escolaridade, experiencia: vaga.experiencia,
      codigo: vaga.codigo, beneficios: vaga.beneficios, salario: vaga.salario,
      empresa: vaga.empresa, categoria: vaga.categoria, periodo: vaga.periodo || periodo, publicada: vaga.publicada,
    });
    setEditingId(vaga.id);
  };

  return (
    <div className="space-y-10">
      <div className="bg-card rounded-[1.5rem] p-8 md:p-10 border border-border shadow-card space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-foreground tracking-tight">Período de Exibição</h3>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Defina as datas que aparecerão no site</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Input 
            value={periodo} 
            onChange={(e) => setPeriodo(tipo, e.target.value)}
            placeholder="Ex: 01/01 a 07/01"
            className="sm:max-w-xs rounded-xl h-12 bg-muted/20 border-border/50 focus:ring-primary/20"
          />
          <Button 
            variant="secondary" 
            onClick={() => toast.success("Período atualizado!")}
            className="rounded-xl h-12 px-8 font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Período
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-[1.5rem] p-8 md:p-10 border border-border shadow-card space-y-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xl text-foreground tracking-tight">
                {editingId ? "Editar Vaga Existente" : "Cadastrar Nova Vaga"}
              </h2>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Preencha os dados abaixo com atenção</p>
            </div>
          </div>
          {editingId && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setEditingId(null);
                setFormData({
                  quantidade: 1, cbo: "", descricao: "", escolaridade: "Não informado",
                  experiencia: "Não informada", codigo: "", beneficios: "", salario: "",
                  empresa: "", categoria: "Serviços", periodo: periodo || "", publicada: true,
                });
              }}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1"/> Cancelar Edição
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3 space-y-3">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Qtd. Vagas</Label>
            <Input 
              type="number" 
              value={formData.quantidade} 
              onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value)||0})} 
              className="rounded-xl h-12 bg-muted/20" 
            />
          </div>
          
          <div className="md:col-span-4 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">CBO (Opcional)</Label>
            <Input 
              value={formData.cbo} 
              onChange={(e) => setFormData({...formData, cbo: e.target.value})} 
              className="rounded-xl h-12 bg-muted/20" 
              placeholder="0000-00"
            />
          </div>

          <div className="md:col-span-5 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">ID da Vaga (Sistema)</Label>
            <Input 
              value={formData.codigo} 
              onChange={(e) => setFormData({...formData, codigo: e.target.value})} 
              className="rounded-xl h-12 bg-muted/20" 
              placeholder="Ex: 7283492"
            />
          </div>

          <div className="md:col-span-12 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Descrição do Cargo / Título da Vaga *</Label>
            <Input 
              value={formData.descricao} 
              onChange={(e) => setFormData({...formData, descricao: e.target.value})} 
              className="rounded-xl h-12 bg-muted/20 border-primary/20 focus:border-primary font-bold text-lg" 
              placeholder="Ex: Auxiliar Administrativo"
            />
          </div>

          <div className="md:col-span-6 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Escolaridade Exigida</Label>
            <Input 
              value={formData.escolaridade} 
              onChange={(e) => setFormData({...formData, escolaridade: e.target.value})} 
              className="rounded-xl h-12 bg-muted/20" 
              placeholder="Ex: Ensino Médio Completo"
            />
          </div>

          <div className="md:col-span-6 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Experiência Necessária</Label>
            <Input 
              value={formData.experiencia} 
              onChange={(e) => setFormData({...formData, experiencia: e.target.value})} 
              className="rounded-xl h-12 bg-muted/20" 
              placeholder="Ex: 6 meses comprovados"
            />
          </div>

          <div className="md:col-span-12 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Benefícios Oferecidos</Label>
            <Input 
              value={formData.beneficios} 
              onChange={(e) => setFormData({...formData, beneficios: e.target.value})} 
              className="rounded-xl h-12 bg-muted/20" 
              placeholder="Ex: VT + VR + Plano de Saúde"
            />
          </div>

          <div className="md:col-span-4 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Faixa Salarial</Label>
            <Input 
              value={formData.salario} 
              onChange={(e) => setFormData({...formData, salario: e.target.value})} 
              className="rounded-xl h-12 bg-muted/20" 
              placeholder="Ex: R$ 1.412,00"
            />
          </div>

          <div className="md:col-span-8 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Empresa (Apenas para controle interno)</Label>
            <Input 
              value={formData.empresa} 
              onChange={(e) => setFormData({...formData, empresa: e.target.value})} 
              className="rounded-xl h-12 bg-muted/20" 
              placeholder="Nome da empresa contratante"
            />
          </div>

          <div className="md:col-span-6 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Área de Atuação / Categoria</Label>
            <Select 
              value={formData.categoria} 
              onValueChange={(val) => setFormData({...formData, categoria: val})}
            >
              <SelectTrigger className="rounded-xl h-12 bg-muted/20">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat.nome} value={cat.nome}>{cat.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-6 flex items-center justify-between px-4 h-12 bg-muted/20 rounded-xl border border-border/50">
            <div className="flex items-center gap-2">
              <Switch checked={formData.publicada} onCheckedChange={(val) => setFormData({...formData, publicada: val})} />
              <Label className="font-bold text-sm cursor-pointer">Publicar vaga imediatamente?</Label>
            </div>
            <Badge className={cn("text-[10px] uppercase font-black", formData.publicada ? "bg-emerald-500" : "bg-slate-400")}>
              {formData.publicada ? "Ativa" : "Rascunho"}
            </Badge>
          </div>

          <div className="md:col-span-12 pt-4">
            <Button type="submit" className="w-full rounded-2xl py-8 font-heading font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all transform hover:-translate-y-1">
                {editingId ? "Atualizar Dados da Vaga" : "Confirmar e Cadastrar Vaga"}
                {!editingId && <PlusCircle className="ml-2 w-5 h-5" />}
                {editingId && <Save className="ml-2 w-5 h-5" />}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-card rounded-[1.5rem] border border-border shadow-card overflow-hidden">
        <div className="p-8 md:p-10 border-b border-border bg-muted/5 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-foreground tracking-tight">Vagas Cadastradas</h3>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Gestão e controle das vagas em exibição</p>
          </div>
          <Badge variant="outline" className="font-bold">{vagas.length} registros</Badge>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-muted/30 border-b border-border text-left">
                        <th className="py-5 px-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Cargo / Descrição</th>
                        <th className="py-5 px-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Empresa</th>
                        <th className="py-5 px-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Qtd</th>
                        <th className="py-5 px-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Salário</th>
                        <th className="py-5 px-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Status</th>
                        <th className="py-5 px-6 text-right font-black uppercase tracking-widest text-[10px] text-muted-foreground">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {vagas.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-foreground italic">Nenhuma vaga cadastrada neste período.</td>
                      </tr>
                    ) : (
                      currentVagas.map((vaga) => (
                        <tr key={vaga.id} className="hover:bg-primary/[0.02] transition-colors group">
                            <td className="py-5 px-6">
                              <div className="flex flex-col">
                                <span className="font-black text-foreground group-hover:text-primary transition-colors">{vaga.descricao}</span>
                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">ID: {vaga.codigo || "S/N"}</span>
                              </div>
                            </td>
                            <td className="py-5 px-4 font-semibold text-muted-foreground">{vaga.empresa || "-"}</td>
                            <td className="py-5 px-4">
                              <Badge variant="secondary" className="font-black">{vaga.quantidade}</Badge>
                            </td>
                            <td className="py-5 px-4 font-bold text-foreground/80">{vaga.salario || "A combinar"}</td>
                            <td className="py-5 px-4">
                                {vaga.publicada ? (
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      Publicada
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-slate-400 font-black text-[10px] uppercase">
                                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                      Rascunho
                                    </div>
                                )}
                            </td>
                            <td className="py-5 px-6 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleEdit(vaga)}
                                  className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => {
                                    if(confirm("Deseja realmente excluir esta vaga?")) {
                                      deleteVaga(tipo, vaga.id);
                                      toast.success("Vaga removida!");
                                    }
                                  }}
                                  className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                        </tr>
                      ))
                    )}
                </tbody>
            </table>
        </div>
        <div className="px-8 pb-4">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
        </div>
      </div>
    </div>
  );
};

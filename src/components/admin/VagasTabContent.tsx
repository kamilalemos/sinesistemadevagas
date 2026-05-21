import { useState } from "react";
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

interface Props {
  tipo: "semana" | "feirao";
}

export const VagasTabContent = ({ tipo }: Props) => {
  const { vagas_semana, vagas_feirao, addVaga, updateVaga, deleteVaga, periodo_semana, periodo_feirao, setPeriodo } = useVagasLocalStore();
  const vagas = tipo === "semana" ? vagas_semana : vagas_feirao;
  const periodo = tipo === "semana" ? periodo_semana : periodo_feirao;

  const [editingId, setEditingId] = useState<string | null>(null);
  
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
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-5 border border-border shadow-card space-y-4">
        <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold text-base text-foreground">Definir Período</h3>
        </div>
        <div className="flex gap-2">
            <Input 
                value={periodo} 
                onChange={(e) => setPeriodo(tipo, e.target.value)}
                placeholder="Ex: 01/01 a 07/01"
                className="max-w-xs rounded-xl"
            />
            <Button variant="secondary" onClick={() => toast.success("Período salvo localmente!")}>Salvar</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 border border-border space-y-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-heading font-bold text-base text-foreground">
            {editingId ? "Editar Vaga" : "Cadastro de Vaga"}
          </h2>
          {editingId && <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}><X className="w-4 h-4 mr-1"/> Cancelar</Button>}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Quantidade de vagas</Label>
            <Input type="number" value={formData.quantidade} onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value)||0})} className="rounded-xl" />
          </div>
          
          <div className="space-y-2">
            <Label>CBO</Label>
            <Input value={formData.cbo} onChange={(e) => setFormData({...formData, cbo: e.target.value})} className="rounded-xl" />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Descrição da vaga *</Label>
            <Input value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Escolaridade</Label>
            <Input value={formData.escolaridade} onChange={(e) => setFormData({...formData, escolaridade: e.target.value})} className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Experiência</Label>
            <Input value={formData.experiencia} onChange={(e) => setFormData({...formData, experiencia: e.target.value})} className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>ID da vaga</Label>
            <Input value={formData.codigo} onChange={(e) => setFormData({...formData, codigo: e.target.value})} className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Benefícios</Label>
            <Input value={formData.beneficios} onChange={(e) => setFormData({...formData, beneficios: e.target.value})} className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Salário</Label>
            <Input value={formData.salario} onChange={(e) => setFormData({...formData, salario: e.target.value})} className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Empresa (interno)</Label>
            <Input value={formData.empresa} onChange={(e) => setFormData({...formData, empresa: e.target.value})} className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Período</Label>
            <Input value={formData.periodo} onChange={(e) => setFormData({...formData, periodo: e.target.value})} className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select 
              value={formData.categoria} 
              onValueChange={(val) => setFormData({...formData, categoria: val})}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat.nome} value={cat.nome}>{cat.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-8">
            <Switch checked={formData.publicada} onCheckedChange={(val) => setFormData({...formData, publicada: val})} />
            <Label>Publicada? (sim/não)</Label>
          </div>

          <div className="md:col-span-2 pt-2">
            <Button type="submit" className="w-full rounded-xl py-6 font-heading font-bold text-base shadow-lg">
                {editingId ? "Salvar Alterações" : "Cadastrar Vaga"}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-card rounded-xl p-5 border border-border shadow-card">
        <h3 className="font-heading font-bold text-base mb-4 text-foreground">Listagem de Vagas</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border text-left font-medium text-muted-foreground">
                        <th className="pb-3 pr-4">Descrição</th>
                        <th className="pb-3 pr-4">Empresa</th>
                        <th className="pb-3 pr-4">Quantidade</th>
                        <th className="pb-3 pr-4">Salário</th>
                        <th className="pb-3 pr-4">ID da Vaga</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {vagas.map((vaga) => (
                        <tr key={vaga.id} className="hover:bg-muted/30">
                            <td className="py-4 pr-4 font-medium">{vaga.descricao}</td>
                            <td className="py-4 pr-4">{vaga.empresa || "-"}</td>
                            <td className="py-4 pr-4">{vaga.quantidade}</td>
                            <td className="py-4 pr-4">{vaga.salario || "A combinar"}</td>
                            <td className="py-4 pr-4 text-xs font-mono">{vaga.codigo}</td>
                            <td className="py-4 pr-4">
                                {vaga.publicada ? (
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Publicada</Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200">Oculta</Badge>
                                )}
                            </td>
                            <td className="py-4 text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(vaga)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteVaga(tipo, vaga.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

import { useState } from "react";
import { PlusCircle, Trash2, Globe, GlobeLock, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { categorias } from "@/store/vagasStore";
import { useVagasLocalStore, VagaLocal } from "@/store/vagasStorage";
import { Badge } from "@/components/ui/badge";

interface Props {
  tipo: "semana" | "feirao";
}

export const SectionCadastroVagas = ({ tipo }: Props) => {
  const { vagas_semana, vagas_feirao, addVaga, updateVaga, deleteVaga } = useVagasLocalStore();
  const vagas = tipo === "semana" ? vagas_semana : vagas_feirao;

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
    publicada: true,
  });

  const resetForm = () => {
    setFormData({
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
      publicada: true,
    });
    setEditingId(null);
  };

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
    resetForm();
  };

  const handleEdit = (vaga: VagaLocal) => {
    setFormData({
      quantidade: vaga.quantidade,
      cbo: vaga.cbo,
      descricao: vaga.descricao,
      escolaridade: vaga.escolaridade,
      experiencia: vaga.experiencia,
      codigo: vaga.codigo,
      beneficios: vaga.beneficios,
      salario: vaga.salario,
      empresa: vaga.empresa,
      categoria: vaga.categoria,
      publicada: vaga.publicada,
    });
    setEditingId(vaga.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta vaga?")) return;
    deleteVaga(tipo, id);
    toast.success("Vaga excluída com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-5 border border-border space-y-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-bold text-base text-foreground">
              {editingId ? "Editar Vaga" : "Cadastro Manual de Vagas"}
            </h2>
          </div>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={resetForm} className="text-muted-foreground">
              <X className="w-4 h-4 mr-1" /> Cancelar Edição
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição da vaga *</Label>
            <Input 
              id="descricao" 
              placeholder="Ex: Auxiliar Administrativo" 
              value={formData.descricao} 
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade de vagas</Label>
            <Input 
              id="quantidade" 
              type="number" 
              value={formData.quantidade} 
              onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value) || 0})}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cbo">CBO</Label>
            <Input 
              id="cbo" 
              placeholder="Ex: 4110-05" 
              value={formData.cbo} 
              onChange={(e) => setFormData({...formData, cbo: e.target.value})}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="escolaridade">Escolaridade</Label>
            <Input 
              id="escolaridade" 
              placeholder="Ex: Ensino Médio Completo" 
              value={formData.escolaridade} 
              onChange={(e) => setFormData({...formData, escolaridade: e.target.value})}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experiencia">Experiência</Label>
            <Input 
              id="experiencia" 
              placeholder="Ex: 6 meses" 
              value={formData.experiencia} 
              onChange={(e) => setFormData({...formData, experiencia: e.target.value})}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo">Código/ID da vaga</Label>
            <Input 
              id="codigo" 
              placeholder="Ex: 1234567" 
              value={formData.codigo} 
              onChange={(e) => setFormData({...formData, codigo: e.target.value})}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salario">Salário</Label>
            <Input 
              id="salario" 
              placeholder="Ex: R$ 1.500,00 ou A combinar" 
              value={formData.salario} 
              onChange={(e) => setFormData({...formData, salario: e.target.value})}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beneficios">Benefícios</Label>
            <Input 
              id="beneficios" 
              placeholder="Ex: VT, VR, Plano de Saúde" 
              value={formData.beneficios} 
              onChange={(e) => setFormData({...formData, beneficios: e.target.value})}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa (APENAS INTERNO)</Label>
            <Input 
              id="empresa" 
              placeholder="Nome da empresa" 
              value={formData.empresa} 
              onChange={(e) => setFormData({...formData, empresa: e.target.value})}
              className="rounded-xl border-dashed border-primary/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
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
            <Switch 
              id="publicada" 
              checked={formData.publicada} 
              onCheckedChange={(val) => setFormData({...formData, publicada: val})} 
            />
            <Label htmlFor="publicada">Vaga Publicada</Label>
          </div>

          <div className="lg:col-span-3 pt-2">
            <Button type="submit" className="w-full rounded-xl py-6 font-heading font-bold text-base shadow-lg transition-all hover:scale-[1.01]">
              {editingId ? <Save className="w-5 h-5 mr-2" /> : <PlusCircle className="w-5 h-5 mr-2" />}
              {editingId ? "Salvar Alterações" : "Cadastrar Vaga"}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-card rounded-xl p-5 border border-border shadow-card">
        <h3 className="font-heading font-bold text-base mb-4 text-foreground">Listagem de Vagas</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-left font-medium text-muted-foreground">
                <th className="pb-3 pr-4">Cargo/Descrição</th>
                <th className="pb-3 pr-4">Quantidade</th>
                <th className="pb-3 pr-4">Empresa</th>
                <th className="pb-3 pr-4">Salário</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vagas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhuma vaga cadastrada.</td>
                </tr>
              ) : (
                vagas.map((vaga) => (
                  <tr key={vaga.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="py-4 pr-4 font-medium text-foreground">{vaga.descricao}</td>
                    <td className="py-4 pr-4">{vaga.quantidade}</td>
                    <td className="py-4 pr-4 italic text-muted-foreground">{vaga.empresa || "-"}</td>
                    <td className="py-4 pr-4">{vaga.salario || "A combinar"}</td>
                    <td className="py-4 pr-4">
                      {vaga.publicada ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Publicada</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-200 text-gray-700">Não publicada</Badge>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(vaga)}
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(vaga.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
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
      </div>
    </div>
  );
};

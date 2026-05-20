import { useState, useEffect } from "react";
import { PlusCircle, Loader2, Trash2, Globe, GlobeLock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { categorias } from "@/store/vagasStore";

export const SectionCadastroManual = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    cargo: "",
    qtd: "1",
    escolaridade: "Não informado",
    experiencia: "Não informada",
    salario: "",
    beneficios: "",
    num_vaga: "",
    empresa: "",
    categoria: "Serviços",
    descricao: "",
    publicada: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cargo) {
      toast.error("O campo Cargo é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("vagas").insert({
        cargo: formData.cargo,
        qtd: parseInt(formData.qtd),
        escolaridade: formData.escolaridade,
        experiencia: formData.experiencia,
        salario: formData.salario,
        beneficios: formData.beneficios,
        num_vaga: formData.num_vaga,
        empresa: formData.empresa,
        categoria: formData.categoria,
        descricao: formData.descricao,
        publicada: formData.publicada,
        tipo: "semana", // Default to semana for manual registration
      });

      if (error) throw error;

      toast.success("Vaga cadastrada com sucesso!");
      setFormData({
        cargo: "",
        qtd: "1",
        escolaridade: "Não informado",
        experiencia: "Não informada",
        salario: "",
        beneficios: "",
        num_vaga: "",
        empresa: "",
        categoria: "Serviços",
        descricao: "",
        publicada: true,
      });
      queryClient.invalidateQueries({ queryKey: ["vagas"] });
    } catch (error: any) {
      toast.error("Erro ao cadastrar vaga: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl p-5 border border-border space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <PlusCircle className="w-5 h-5 text-primary" />
        <h2 className="font-heading font-bold text-base text-foreground">Cadastro Manual de Vagas</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cargo">Cargo *</Label>
          <Input 
            id="cargo" 
            placeholder="Ex: Auxiliar Administrativo" 
            value={formData.cargo} 
            onChange={(e) => setFormData({...formData, cargo: e.target.value})}
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="qtd">Quantidade</Label>
          <Input 
            id="qtd" 
            type="number" 
            value={formData.qtd} 
            onChange={(e) => setFormData({...formData, qtd: e.target.value})}
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
          <Label htmlFor="num_vaga">Código da Vaga (SINE)</Label>
          <Input 
            id="num_vaga" 
            placeholder="Ex: 1234567" 
            value={formData.num_vaga} 
            onChange={(e) => setFormData({...formData, num_vaga: e.target.value})}
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="empresa">Empresa (Controle Interno)</Label>
          <Input 
            id="empresa" 
            placeholder="Nome da empresa" 
            value={formData.empresa} 
            onChange={(e) => setFormData({...formData, empresa: e.target.value})}
            className="rounded-xl"
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

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="descricao">Descrição Adicional</Label>
          <Textarea 
            id="descricao" 
            placeholder="Detalhes sobre a vaga..." 
            value={formData.descricao} 
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            className="rounded-xl min-h-[100px]"
          />
        </div>

        <div className="md:col-span-2 pt-2">
          <Button type="submit" disabled={loading} className="w-full rounded-xl py-6 font-heading font-bold text-base">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <PlusCircle className="w-5 h-5 mr-2" />}
            Cadastrar Vaga
          </Button>
        </div>
      </form>
    </div>
  );
};

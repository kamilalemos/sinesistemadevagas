import { useState } from "react";
import { PlusCircle, Trash2, Edit, Save, X, Calendar, Layers, Archive, History, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useVagasLocalStore, VagaLocal, SemanaTipo } from "@/store/vagasStorage";
import { categorias } from "@/store/vagasStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const VagasTabContent = () => {
  const { 
    vagas, 
    addVaga, 
    updateVaga, 
    deleteVaga, 
    periodos, 
    setPeriodo,
    mes_atual,
    semana_ativa,
    setSemanaAtiva,
    gerarBackup,
    encerrarMes,
    historico,
    restaurarMes
  } = useVagasLocalStore();

  const [currentSemanaView, setCurrentSemanaView] = useState<SemanaTipo>('semana1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
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
    periodo: "",
    publicada: true,
  });

  const currentVagas = vagas[currentSemanaView] || [];
  const currentPeriodo = periodos[currentSemanaView] || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao) {
      toast.error("O campo Descrição da vaga é obrigatório");
      return;
    }
    
    // Usar o período da semana se o campo estiver vazio
    const finalData = {
        ...formData,
        periodo: formData.periodo || currentPeriodo
    };

    if (editingId) {
      updateVaga(currentSemanaView, editingId, finalData);
      toast.success("Vaga atualizada com sucesso!");
    } else {
      addVaga(currentSemanaView, finalData);
      toast.success("Vaga cadastrada na " + currentSemanaView.replace('semana', 'Semana ') + " com sucesso!");
    }
    setEditingId(null);
    setFormData({
      quantidade: 1, cbo: "", descricao: "", escolaridade: "Não informado",
      experiencia: "Não informada", codigo: "", beneficios: "", salario: "",
      empresa: "", categoria: "Serviços", periodo: "", publicada: true,
    });
  };

  const handleEdit = (vaga: VagaLocal) => {
    setFormData({
      quantidade: vaga.quantidade, cbo: vaga.cbo, descricao: vaga.descricao,
      escolaridade: vaga.escolaridade, experiencia: vaga.experiencia,
      codigo: vaga.codigo, beneficios: vaga.beneficios, salario: vaga.salario,
      empresa: vaga.empresa, categoria: vaga.categoria, periodo: vaga.periodo, publicada: vaga.publicada,
    });
    setEditingId(vaga.id);
  };

  const handleEncerrarMes = () => {
    if (confirm("Deseja realmente encerrar o mês atual? Isso gerará um backup automático e limpará as semanas para o novo mês.")) {
        encerrarMes();
        toast.success("Mês encerrado e backup gerado com sucesso!");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header de Controle Mensal */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-primary/5 p-6 rounded-2xl border border-primary/10">
        <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl">
                <Calendar className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-heading font-bold text-lg">Operação Mensal</h3>
                <p className="text-sm text-muted-foreground">Mês Referência: <span className="font-bold text-primary">{mes_atual}</span></p>
            </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl gap-2" onClick={() => setShowHistory(!showHistory)}>
                <History className="w-4 h-4" />
                Histórico
            </Button>
            <Button variant="outline" className="rounded-xl gap-2" onClick={() => { gerarBackup(); toast.success("Backup manual gerado!"); }}>
                <Archive className="w-4 h-4" />
                Backup
            </Button>
            <Button className="rounded-xl gap-2 bg-primary hover:bg-primary/90" onClick={handleEncerrarMes}>
                <Layers className="w-4 h-4" />
                Encerrar Mês
            </Button>
        </div>
      </div>

      {showHistory && (
        <Card className="rounded-xl border-dashed border-2 animate-fade-in">
            <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <History className="w-4 h-4" /> Histórico de Backups
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {historico.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic text-center py-4">Nenhum histórico encontrado ainda.</p>
                    ) : (
                        historico.map(backup => (
                            <div key={backup.mes} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                                <div>
                                    <p className="font-bold text-sm">Portal SINE - {backup.mes}</p>
                                    <p className="text-[10px] text-muted-foreground">Gerado em: {new Date(backup.timestamp).toLocaleString()}</p>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => { restaurarMes(backup); toast.success("Mês restaurado!"); }}>Restaurar</Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navegação de Semanas */}
        <div className="lg:col-span-12">
            <Tabs value={currentSemanaView} onValueChange={(val) => setCurrentSemanaView(val as SemanaTipo)} className="w-full">
                <TabsList className="grid grid-cols-5 w-full h-auto p-1 bg-muted rounded-xl">
                    <TabsTrigger value="semana1" className="rounded-lg py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">Semana 1</TabsTrigger>
                    <TabsTrigger value="semana2" className="rounded-lg py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">Semana 2</TabsTrigger>
                    <TabsTrigger value="semana3" className="rounded-lg py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">Semana 3</TabsTrigger>
                    <TabsTrigger value="semana4" className="rounded-lg py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">Semana 4</TabsTrigger>
                    <TabsTrigger value="feirao" className="rounded-lg py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">Feirão</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>

        {/* Configuração da Semana */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-xl shadow-card border-primary/20">
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" /> Período da {currentSemanaView.replace('semana', 'Semana ')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Data de exibição</Label>
                        <Input 
                            value={currentPeriodo} 
                            onChange={(e) => setPeriodo(currentSemanaView, e.target.value)}
                            placeholder="Ex: 01/05 a 07/05"
                            className="rounded-xl"
                        />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-medium">Semana Ativa no Site?</span>
                        <Switch 
                            checked={semana_ativa === currentSemanaView} 
                            onCheckedChange={() => setSemanaAtiva(currentSemanaView)} 
                        />
                    </div>
                    {semana_ativa === currentSemanaView ? (
                        <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                            <AlertCircle className="w-3 h-3" /> ESTA SEMANA ESTÁ VISÍVEL NO SITE
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted p-2 rounded-lg border border-border">
                            <AlertCircle className="w-3 h-3" /> Esta semana não está ativa no portal
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-xl shadow-card">
                <CardHeader>
                    <CardTitle className="text-sm font-bold">{editingId ? "Editar Vaga" : "Nova Vaga"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Descrição da vaga *</Label>
                            <Input value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} className="rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Quantidade</Label>
                                <Input type="number" value={formData.quantidade} onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value)||0})} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label>ID da vaga</Label>
                                <Input value={formData.codigo} onChange={(e) => setFormData({...formData, codigo: e.target.value})} className="rounded-xl" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Empresa (Interno)</Label>
                            <Input value={formData.empresa} onChange={(e) => setFormData({...formData, empresa: e.target.value})} className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label>Salário</Label>
                            <Input value={formData.salario} onChange={(e) => setFormData({...formData, salario: e.target.value})} className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select value={formData.categoria} onValueChange={(val) => setFormData({...formData, categoria: val})}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categorias.map((cat) => (
                                        <SelectItem key={cat.nome} value={cat.nome}>{cat.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={formData.publicada} onCheckedChange={(val) => setFormData({...formData, publicada: val})} />
                            <Label className="text-xs">Publicada?</Label>
                        </div>
                        <Button type="submit" className="w-full rounded-xl font-bold">
                            {editingId ? "Salvar Alterações" : "Cadastrar Vaga"}
                        </Button>
                        {editingId && <Button variant="ghost" className="w-full text-xs" onClick={() => setEditingId(null)}>Cancelar edição</Button>}
                    </form>
                </CardContent>
            </Card>
        </div>

        {/* Listagem */}
        <div className="lg:col-span-8">
            <Card className="rounded-xl shadow-card overflow-hidden">
                <div className="bg-muted/50 p-4 border-b border-border flex justify-between items-center">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" /> Vagas da {currentSemanaView.replace('semana', 'Semana ')}
                    </h3>
                    <Badge variant="outline" className="bg-white">{currentVagas.length} Registros</Badge>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/20 border-b border-border text-left font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                                <th className="p-4">Cargo</th>
                                <th className="p-4">Empresa</th>
                                <th className="p-4">Qtd</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {currentVagas.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-muted-foreground italic">Nenhuma vaga cadastrada nesta semana.</td>
                                </tr>
                            ) : (
                                currentVagas.map((vaga) => (
                                    <tr key={vaga.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold">{vaga.descricao}</div>
                                            <div className="text-[10px] text-muted-foreground">ID: {vaga.codigo || '-'}</div>
                                        </td>
                                        <td className="p-4 text-xs font-medium text-primary">{vaga.empresa || "-"}</td>
                                        <td className="p-4 font-mono font-bold text-primary">{vaga.quantidade}</td>
                                        <td className="p-4">
                                            {vaga.publicada ? (
                                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[9px] h-5">PUBLICADA</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-[9px] h-5 opacity-50">OCULTA</Badge>
                                            )}
                                        </td>
                                        <td className="p-4 text-right space-x-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(vaga)}><Edit className="h-3.5 w-3.5" /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteVaga(currentSemanaView, vaga.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};
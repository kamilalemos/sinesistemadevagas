import { useState } from "react";
import { Eye, EyeOff, Layout, Bell, Image as ImageIcon, Link as LinkIcon, Type, FileText, Upload, Loader2, Play, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useVagasLocalStore } from "@/store/vagasStorage";
import { usePopupStore } from "@/store/popupStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PopupInformativo } from "../PopupInformativo";

export function VisibilidadePage() {
  const { semana_ativa, setSemanaAtiva } = useVagasLocalStore();

  const { config, setAtivo, updateConfig } = usePopupStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem válida.");
      return;
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB.");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `popup-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('portal_assets')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('portal_assets')
        .getPublicUrl(filePath);

      updateConfig({ imagem: publicUrl });
      toast.success("Imagem enviada com sucesso!");
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar imagem: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-2xl">Visibilidade do Portal</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <CardTitle>Semana Ativa</CardTitle>
            </div>
            <CardDescription>Qual semana deve aparecer no portal agora?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={semana_ativa} onValueChange={(val) => setSemanaAtiva(val as any)}>
                <SelectTrigger className="rounded-xl">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="semana1">Semana 1</SelectItem>
                    <SelectItem value="semana2">Semana 2</SelectItem>
                    <SelectItem value="semana3">Semana 3</SelectItem>
                    <SelectItem value="semana4">Semana 4</SelectItem>
                    <SelectItem value="feirao">Feirão</SelectItem>
                </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layout className="w-5 h-5 text-secondary" />
              <CardTitle>Controles de Seção</CardTitle>
            </div>
            <CardDescription>Configurações gerais de layout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
               <div>
                  <p className="font-medium">Banner Rotativo</p>
                  <p className="text-xs text-muted-foreground">Exibir banners de destaque no topo</p>
               </div>
               <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <CardTitle>Pop-up Informativo</CardTitle>
            </div>
            <CardDescription>Avisos importantes ao abrir o site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50 mb-4">
               <div>
                  <p className="font-medium">Status do Pop-up</p>
                  <p className="text-xs text-muted-foreground">Ativar ou desativar exibição pública</p>
               </div>
               <Switch checked={config.ativo} onCheckedChange={setAtivo} />
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Frequência de Exibição
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={config.frequencia === 'sessao' || !config.frequencia ? "secondary" : "outline"}
                    className="rounded-xl text-xs h-9"
                    onClick={() => updateConfig({ frequencia: 'sessao' })}
                  >
                    Uma vez por sessão
                  </Button>
                  <Button
                    variant={config.frequencia === 'diario' ? "secondary" : "outline"}
                    className="rounded-xl text-xs h-9"
                    onClick={() => updateConfig({ frequencia: 'diario' })}
                  >
                    Uma vez por dia
                  </Button>
                  <Button
                    variant={config.frequencia === 'sempre' ? "secondary" : "outline"}
                    className="rounded-xl text-xs h-9"
                    onClick={() => updateConfig({ frequencia: 'sempre' })}
                  >
                    Sempre (cada recarga)
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  Título
                </Label>
                <Input 
                  value={config.titulo} 
                  onChange={(e) => updateConfig({ titulo: e.target.value })}
                  placeholder="Ex: Novo Feirão Disponível"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Descrição
                </Label>
                <Textarea 
                  value={config.descricao} 
                  onChange={(e) => updateConfig({ descricao: e.target.value })}
                  placeholder="Descreva o comunicado..."
                  className="rounded-xl min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  Imagem do Pop-up
                </Label>
                <div className="flex flex-col gap-3">
                  {config.imagem && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border group">
                      <img src={config.imagem} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="h-8 rounded-lg"
                          onClick={() => updateConfig({ imagem: "" })}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input 
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="popup-image-upload"
                        disabled={isUploading}
                      />
                      <Label 
                        htmlFor="popup-image-upload"
                        className={`flex items-center justify-center gap-2 w-full h-10 px-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {isUploading ? 'Enviando...' : 'Fazer upload de imagem'}
                        </span>
                      </Label>
                    </div>
                    <div className="flex-[2]">
                      <Input 
                        value={config.imagem} 
                        onChange={(e) => updateConfig({ imagem: e.target.value })}
                        placeholder="Ou cole uma URL aqui..."
                        className="rounded-xl h-10"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">Recomendado: 800x600px, máx 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Texto do Botão</Label>
                  <Input 
                    value={config.botaoTexto} 
                    onChange={(e) => updateConfig({ botaoTexto: e.target.value })}
                    placeholder="Entendi"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                    Link do Botão
                  </Label>
                  <Input 
                    value={config.botaoLink} 
                    onChange={(e) => updateConfig({ botaoLink: e.target.value })}
                    placeholder="https://..."
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <Button 
                onClick={() => setIsPreviewOpen(true)}
                variant="outline"
                className="w-full rounded-xl gap-2 font-heading font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Play className="w-4 h-4" />
                Pré-visualizar Pop-up no Site
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {isPreviewOpen && (
        <PopupInformativo forcedOpen={true} onClose={() => setIsPreviewOpen(false)} />
      )}
    </div>
  );
}
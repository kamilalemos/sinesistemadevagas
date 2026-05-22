import { Eye, EyeOff, Layout, Bell, Image as ImageIcon, Link as LinkIcon, Type, FileText, Upload, Trash2, Smartphone, Monitor, ArrowRight, X, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useVagasLocalStore } from "@/store/vagasStorage";
import { usePopupStore } from "@/store/popupStorage";
import { useBannerStore } from "@/store/bannerStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function VisibilidadePage() {
  const { semana_ativa, feirao_ativa, setVisibilidade } = useVagasLocalStore();
  const { config: popupConfig, setAtivo: setPopupAtivo, updateConfig: updatePopupConfig } = usePopupStore();
  const { config: bannerConfig, setAtivo: setBannerAtivo, updateConfig: updateBannerConfig } = useBannerStore();
  
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('desktop');
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const popupInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'popup') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 2MB para base64 localStorage)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 2MB permitido.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'banner') {
        updateBannerConfig({ imagemBase64: base64String });
      } else {
        updatePopupConfig({ imagemBase64: base64String });
      }
      toast.success("Imagem carregada com sucesso!");
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: 'banner' | 'popup') => {
    if (type === 'banner') {
      updateBannerConfig({ imagemBase64: "" });
    } else {
      updatePopupConfig({ imagemBase64: "" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-2xl">Gestão de Conteúdo Visual</h2>
          <p className="text-muted-foreground text-sm">Configure o que o cidadão vê ao entrar no portal</p>
        </div>
        
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg self-start">
          <Button 
            variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setPreviewDevice('desktop')}
            className="gap-2 rounded-md h-8"
          >
            <Monitor className="w-4 h-4" />
            Desktop
          </Button>
          <Button 
            variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setPreviewDevice('mobile')}
            className="gap-2 rounded-md h-8"
          >
            <Smartphone className="w-4 h-4" />
            Mobile
          </Button>
        </div>
      </div>
      
      {/* Seções de Visibilidade Simples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-xl shadow-card overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Vagas da Semana</CardTitle>
            </div>
            <CardDescription>Status da listagem principal no portal</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex items-center justify-between">
            <span className={cn("text-sm font-bold", semana_ativa ? "text-green-600" : "text-muted-foreground")}>
              {semana_ativa ? "PUBLICADO E VISÍVEL" : "OCULTO PARA O PÚBLICO"}
            </span>
            <Switch checked={semana_ativa} onCheckedChange={(v) => setVisibilidade("semana", v)} />
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-card overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-secondary" />
              <CardTitle className="text-lg">Feirão da Empregabilidade</CardTitle>
            </div>
            <CardDescription>Status da seção especial do feirão</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex items-center justify-between">
            <span className={cn("text-sm font-bold", feirao_ativa ? "text-secondary" : "text-muted-foreground")}>
              {feirao_ativa ? "PUBLICADO E VISÍVEL" : "OCULTO PARA O PÚBLICO"}
            </span>
            <Switch checked={feirao_ativa} onCheckedChange={(v) => setVisibilidade("feirao", v)} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Banner Principal Config */}
        <div className="space-y-6">
          <Card className="rounded-xl shadow-card">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layout className="w-5 h-5 text-primary" />
                  <CardTitle>Banner de Destaque</CardTitle>
                </div>
                <Switch checked={bannerConfig.ativo} onCheckedChange={setBannerAtivo} />
              </div>
              <CardDescription>Configure o banner principal do topo do site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Título do Banner</Label>
                  <Input 
                    value={bannerConfig.titulo} 
                    onChange={(e) => updateBannerConfig({ titulo: e.target.value })}
                    placeholder="Ex: Painel da Empregabilidade"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subtítulo / Descrição</Label>
                  <Input 
                    value={bannerConfig.descricao} 
                    onChange={(e) => updateBannerConfig({ descricao: e.target.value })}
                    placeholder="Ex: de João Pessoa"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Imagem de Fundo</Label>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={bannerInputRef} 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'banner')}
                    />
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2 rounded-xl"
                      onClick={() => bannerInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      Selecionar Imagem
                    </Button>
                    {bannerConfig.imagemBase64 && (
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="rounded-xl"
                        onClick={() => removeImage('banner')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Recomendado: 1920x600px. Máximo 2MB.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Texto do Botão</Label>
                    <Input 
                      value={bannerConfig.textoBotao} 
                      onChange={(e) => updateBannerConfig({ textoBotao: e.target.value })}
                      placeholder="Ver Vagas"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Link do Botão</Label>
                    <Input 
                      value={bannerConfig.linkBotao} 
                      onChange={(e) => updateBannerConfig({ linkBotao: e.target.value })}
                      placeholder="/vagas"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banner Preview Area */}
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider ml-1">Preview do Banner (Tempo Real)</Label>
            <div className={cn(
              "border rounded-2xl overflow-hidden bg-background shadow-sm transition-all duration-300",
              previewDevice === 'mobile' ? "max-w-[375px] mx-auto aspect-[9/16]" : "w-full aspect-video md:aspect-[21/9]"
            )}>
              <div 
                className="w-full h-full relative flex items-center justify-center text-center p-6 overflow-hidden"
                style={{
                  background: bannerConfig.imagemBase64 
                    ? `linear-gradient(rgba(0, 56, 147, 0.7), rgba(0, 56, 147, 0.85)), url(${bannerConfig.imagemBase64})` 
                    : 'linear-gradient(135deg, #003893 0%, #002d75 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!bannerConfig.imagemBase64 && (
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
                )}
                
                <div className="relative z-10 space-y-3">
                  <h3 className="font-heading font-extrabold text-white text-xl md:text-3xl lg:text-4xl drop-shadow-md">
                    {bannerConfig.titulo || "Título do Banner"}
                  </h3>
                  <p className="text-white/90 text-sm md:text-lg max-w-md mx-auto drop-shadow-sm">
                    {bannerConfig.descricao || "Descrição do banner aparecerá aqui"}
                  </p>
                  {bannerConfig.textoBotao && (
                    <div className="pt-2">
                      <Button size="sm" className="rounded-full px-6 bg-white text-primary hover:bg-white/90 font-bold pointer-events-none">
                        {bannerConfig.textoBotao}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pop-up Informativo Config */}
        <div className="space-y-6">
          <Card className="rounded-xl shadow-card">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <CardTitle>Pop-up Informativo</CardTitle>
                </div>
                <Switch checked={popupConfig.ativo} onCheckedChange={setPopupAtivo} />
              </div>
              <CardDescription>Comunicados importantes exibidos ao entrar no site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Título do Pop-up</Label>
                  <Input 
                    value={popupConfig.titulo} 
                    onChange={(e) => updatePopupConfig({ titulo: e.target.value })}
                    placeholder="Ex: Aviso Importante"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Conteúdo do Aviso</Label>
                  <Textarea 
                    value={popupConfig.descricao} 
                    onChange={(e) => updatePopupConfig({ descricao: e.target.value })}
                    placeholder="Escreva o comunicado..."
                    className="rounded-xl min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Imagem Ilustrativa</Label>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={popupInputRef} 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'popup')}
                    />
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2 rounded-xl"
                      onClick={() => popupInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      Selecionar Imagem
                    </Button>
                    {popupConfig.imagemBase64 && (
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="rounded-xl"
                        onClick={() => removeImage('popup')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Texto do Botão</Label>
                    <Input 
                      value={popupConfig.botaoTexto} 
                      onChange={(e) => updatePopupConfig({ botaoTexto: e.target.value })}
                      placeholder="Entendi"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Link de Ação</Label>
                    <Input 
                      value={popupConfig.botaoLink} 
                      onChange={(e) => updatePopupConfig({ botaoLink: e.target.value })}
                      placeholder="https://..."
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pop-up Preview Area */}
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider ml-1">Preview do Pop-up (Simulação)</Label>
            <div className={cn(
              "border rounded-2xl overflow-hidden bg-muted/20 shadow-inner p-4 transition-all duration-300 relative flex items-center justify-center",
              previewDevice === 'mobile' ? "max-w-[375px] mx-auto h-[500px]" : "w-full h-[500px]"
            )}>
              {/* Overlay simulation */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0 rounded-2xl" />
              
              {/* Modal simulation */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                key={`${popupConfig.titulo}-${popupConfig.imagemBase64}`}
                className={cn(
                  "relative z-10 bg-card rounded-2xl shadow-2xl overflow-hidden border border-border transition-all duration-300",
                  previewDevice === 'mobile' ? "w-full max-w-[280px]" : "w-full max-w-[360px]"
                )}
              >
                <button className="absolute top-2 right-2 p-1.5 rounded-full bg-black/5 hover:bg-black/10 z-10">
                  <X className="w-3.5 h-3.5" />
                </button>

                {popupConfig.imagemBase64 && (
                  <div className="w-full aspect-video bg-muted overflow-hidden">
                    <img src={popupConfig.imagemBase64} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-4 space-y-2">
                  <div className="space-y-1">
                    <h4 className="font-heading font-extrabold text-foreground text-sm md:text-base leading-tight">
                      {popupConfig.titulo || "Título do Comunicado"}
                    </h4>
                    <div className="w-8 h-0.5 bg-primary rounded-full" />
                  </div>
                  
                  <p className="text-muted-foreground text-[11px] md:text-xs leading-relaxed line-clamp-4">
                    {popupConfig.descricao || "O texto do seu comunicado aparecerá aqui de forma clara e organizada para o cidadão."}
                  </p>

                  <div className="pt-2 flex flex-col gap-2">
                    {popupConfig.botaoTexto && (
                      <Button className="w-full h-8 rounded-lg text-[10px] md:text-xs font-bold bg-primary hover:bg-primary/90 gap-1 pointer-events-none">
                        {popupConfig.botaoTexto}
                        {popupConfig.botaoLink && <ExternalLink className="w-3 h-3" />}
                      </Button>
                    )}
                    <Button variant="outline" className="w-full h-8 rounded-lg text-[10px] md:text-xs font-semibold pointer-events-none">
                      Fechar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
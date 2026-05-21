import { Eye, EyeOff, Layout, Bell, Image as ImageIcon, Link as LinkIcon, Type, FileText } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useVagasLocalStore } from "@/store/vagasStorage";
import { usePopupStore } from "@/store/popupStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function VisibilidadePage() {
  const { semana_ativa, feirao_ativa, setVisibilidade } = useVagasLocalStore();
  const { config, setAtivo, updateConfig } = usePopupStore();

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-2xl">Visibilidade do Portal</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <CardTitle>Vagas da Semana</CardTitle>
            </div>
            <CardDescription>Controla se esta seção aparece no site público</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-sm font-medium">Status: {semana_ativa ? "Visível" : "Oculto"}</span>
            <Switch checked={semana_ativa} onCheckedChange={(v) => setVisibilidade("semana", v)} />
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-secondary" />
              <CardTitle>Feirão da Empregabilidade</CardTitle>
            </div>
            <CardDescription>Controla se esta seção aparece no site público</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-sm font-medium">Status: {feirao_ativa ? "Visível" : "Oculto"}</span>
            <Switch checked={feirao_ativa} onCheckedChange={(v) => setVisibilidade("feirao", v)} />
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
                  URL da Imagem (Opcional)
                </Label>
                <Input 
                  value={config.imagem} 
                  onChange={(e) => updateConfig({ imagem: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="rounded-xl"
                />
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
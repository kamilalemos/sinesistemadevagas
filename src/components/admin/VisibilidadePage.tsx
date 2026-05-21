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

      <Card className="rounded-xl shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-secondary" />
            <CardTitle>Controles de Seção</CardTitle>
          </div>
          <CardDescription>Configurações gerais de layout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
             <div>
                <p className="font-medium">Banner Rotativo</p>
                <p className="text-xs text-muted-foreground">Exibir banners de destaque no topo</p>
             </div>
             <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
             <div>
                <p className="font-medium">Pop-up Informativo</p>
                <p className="text-xs text-muted-foreground">Mostrar avisos importantes ao abrir o site</p>
             </div>
             <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
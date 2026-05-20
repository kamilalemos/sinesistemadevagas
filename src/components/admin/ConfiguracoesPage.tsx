import { KeyRound, Shield, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const ConfiguracoesPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-2xl">Configurações do Sistema</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              <CardTitle>Alterar Senha</CardTitle>
            </div>
            <CardDescription>Mantenha sua conta segura</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Senha Atual</Label>
              <Input type="password" placeholder="********" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <Input type="password" placeholder="********" className="rounded-xl" />
            </div>
            <Button className="w-full rounded-xl" onClick={() => toast.success("Senha alterada localmente!")}>Atualizar Senha</Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-secondary" />
              <CardTitle>Gerenciar Acessos</CardTitle>
            </div>
            <CardDescription>Adicionar novos administradores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail do Novo Admin</Label>
              <Input type="email" placeholder="admin@exemplo.com" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Senha Temporária</Label>
              <Input type="password" placeholder="********" className="rounded-xl" />
            </div>
            <Button variant="secondary" className="w-full rounded-xl" onClick={() => toast.success("Novo admin simulado com sucesso!")}>Criar Acesso</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Status do Sistema</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-700 rounded-lg border border-green-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">Sistema operando localmente via LocalStorage</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
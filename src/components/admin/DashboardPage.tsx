import { Briefcase, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVagasLocalStore } from "@/store/vagasStorage";

export const DashboardPage = () => {
  const { vagas_semana, vagas_feirao } = useVagasLocalStore();
  
  const totalVagas = vagas_semana.reduce((acc, v) => acc + v.quantidade, 0) + 
                     vagas_feirao.reduce((acc, v) => acc + v.quantidade, 0);

  const stats = [
    { title: "Total de Vagas", value: totalVagas, icon: Briefcase, color: "text-blue-500" },
    { title: "Vagas da Semana", value: vagas_semana.length, icon: TrendingUp, color: "text-green-500" },
    { title: "Vagas no Feirão", value: vagas_feirao.length, icon: Users, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-2xl">Dashboard Administrativo</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="rounded-xl shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">Atualizado agora mesmo</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <CardTitle>Bem-vindo, Administrador</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Este é o seu painel de controle. Aqui você pode gerenciar todas as vagas disponíveis no SINE João Pessoa de forma local e rápida.
              As alterações feitas aqui são refletidas imediatamente na área pública do site.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
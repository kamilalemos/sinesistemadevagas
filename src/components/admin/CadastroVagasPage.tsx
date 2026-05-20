import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VagasTabContent } from "./VagasTabContent";

export const CadastroVagasPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-2xl">Cadastro de Vagas</h2>
      <Tabs defaultValue="semana" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="semana">Vagas da Semana</TabsTrigger>
          <TabsTrigger value="feirao">Feirão da Empregabilidade</TabsTrigger>
        </TabsList>
        <TabsContent value="semana"><VagasTabContent tipo="semana" /></TabsContent>
        <TabsContent value="feirao"><VagasTabContent tipo="feirao" /></TabsContent>
      </Tabs>
    </div>
  );
};
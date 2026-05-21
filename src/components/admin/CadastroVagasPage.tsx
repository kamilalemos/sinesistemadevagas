import { useVagasLocalStore } from "@/store/vagasStorage";
import { VagasTabContent } from "./VagasTabContent";

export const CadastroVagasPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-2xl">Gestão de Vagas</h2>
      <VagasTabContent />
    </div>
  );
};
import { VagaLocal } from '@/types';
import { toast } from 'sonner';

/**
 * Generates and downloads a CSV file from an array of vagas.
 */
export const exportToCSV = (vagas: VagaLocal[], filename: string, _includePeriodColumn = true) => {
  try {
    if (!vagas || vagas.length === 0) {
      toast.error("Nenhuma vaga disponível para exportar.");
      return;
    }

    const headers = ["Quantidade", "CBO", "Descrição", "Escolaridade", "Experiência", "ID da Vaga", "Benefícios", "Salário", "Empresa", "Publicada", "Data", "Período"];

    const csvRows = vagas.map(v => {
      const row = [
        v.quantidade || 0,
        v.cbo || "",
        v.descricao || "",
        v.escolaridade || "",
        v.experiencia || "",
        v.id || "",
        v.beneficios || "",
        v.salario || "",
        v.empresa || "",
        v.publicada ? "Sim" : "Não",
        v.createdAt || "",
        v.periodo || ""
      ];

      return row.map(field => {
        const stringField = String(field).replace(/"/g, '""');
        return `"${stringField}"`;
      }).join(",");
    });

    const csvContent = "\ufeff" + [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    toast.success(`CSV exportado: ${vagas.length} registros.`);
  } catch (error) {
    console.error("Erro ao exportar CSV:", error);
    toast.error("Falha ao gerar o arquivo CSV.");
  }
};

/**
 * Generates and downloads a JSON file for backup.
 */
export const exportToJSON = (data: any, filename: string) => {
  try {
    if (!data) {
      toast.error("Dados inválidos para backup.");
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    toast.success("Backup JSON gerado com sucesso!");
  } catch (error) {
    console.error("Erro ao exportar JSON:", error);
    toast.error("Falha ao gerar o arquivo JSON.");
  }
};

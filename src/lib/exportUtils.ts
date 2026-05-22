import { VagaLocal, HistoricoMensal } from '@/types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'sonner';

// Type augmentation for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Generates and downloads a CSV file from an array of vagas.
 * Handles escaping and encoding correctly.
 */
export const exportToCSV = (vagas: VagaLocal[], filename: string) => {
  try {
    if (!vagas || vagas.length === 0) {
      toast.error("Nenhuma vaga disponível para exportar.");
      return;
    }

    // Filter to only export what's requested in the prompt
    // Colunas: Quantidade, CBO, Descrição, Escolaridade, Experiência, ID da vaga, Benefícios, Salário, Empresa, Publicada, Data
    const headers = ["Quantidade", "CBO", "Descrição", "Escolaridade", "Experiência", "ID da Vaga", "Benefícios", "Salário", "Empresa", "Publicada", "Data"];
    
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
        v.createdAt || ""
      ];
      
      // Escape fields that might contain commas or quotes
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

/**
 * Generates and downloads a PDF file with institutional branding.
 */
export const exportToPDF = (vagas: VagaLocal[], title: string, filename: string) => {
  try {
    if (!vagas || vagas.length === 0) {
      toast.error("Nenhuma vaga disponível para exportar.");
      return;
    }

    const doc = new jsPDF();
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR');

    // Branding / Header
    doc.setFillColor(0, 56, 147); // SINE Blue
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("SINE JOÃO PESSOA", 105, 18, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(title.toUpperCase(), 105, 28, { align: 'center' });
    
    // Metadata
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.text(`Data da Exportação: ${dateStr} às ${timeStr}`, 15, 50);
    doc.text(`Total de Vagas: ${vagas.length}`, 15, 56);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 60, 195, 60);

    // Table
    const tableHeaders = [["Descrição", "CBO", "Escolaridade", "Qtd", "Empresa"]];
    const tableData = vagas.map(v => [
      v.descricao || "-",
      v.cbo || "-",
      v.escolaridade || "-",
      v.quantidade || "0",
      v.empresa || "-"
    ]);

    doc.autoTable({
      startY: 65,
      head: tableHeaders,
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [0, 56, 147],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 60 }, // Descrição
        1: { cellWidth: 25 }, // CBO
        2: { cellWidth: 40 }, // Escolaridade
        3: { cellWidth: 15 }, // Qtd
        4: { cellWidth: 40 }  // Empresa
      },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      margin: { left: 15, right: 15 }
    });

    // Footer on each page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount} - Painel da Empregabilidade SINE JP`,
        105, 
        285, 
        { align: 'center' }
      );
    }

    doc.save(`${filename}.pdf`);
    toast.success("PDF gerado com sucesso!");
  } catch (error) {
    console.error("Erro ao exportar PDF:", error);
    toast.error("Falha ao gerar o arquivo PDF.");
  }
};

/**
 * Specifically for Monthly History export
 */
export const exportHistoryToPDF = (item: HistoricoMensal) => {
  try {
    const allPublishedVagas: VagaLocal[] = [];
    
    // Collect all published vagas from the month
    if (item.weeks) {
      [1, 2, 3, 4].forEach(w => {
        const weekKey = `semana_${w}` as keyof typeof item.weeks;
        const weekVagas = item.weeks[weekKey]?.vagas?.filter(v => v.publicada) || [];
        allPublishedVagas.push(...weekVagas);
      });
    }
    
    if (item.feirao?.vagas) {
      const feiraoVagas = item.feirao.vagas.filter(v => v.publicada) || [];
      allPublishedVagas.push(...feiraoVagas);
    }

    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    
    // If month is a number (1-12), convert to name, otherwise use as is
    const monthLabel = typeof item.month === 'number' 
      ? monthNames[item.month - 1] 
      : item.month;

    exportToPDF(
      allPublishedVagas, 
      `Histórico Mensal: ${monthLabel} / ${item.year}`,
      `sine-historico-${monthLabel}-${item.year}`
    );
  } catch (error) {
    console.error("Erro ao exportar histórico:", error);
    toast.error("Falha ao exportar histórico.");
  }
};

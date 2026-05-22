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

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

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
 * Generates institutional PDF blob or dataURL for preview or download.
 */
export const generatePDF = (vagas: VagaLocal[], title: string) => {
  try {
    if (!vagas || vagas.length === 0) {
      return null;
    }

    // Configuração Landscape A4
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    }) as any;

    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR');

    // Cabeçalho Institucional Azul SINE
    doc.setFillColor(0, 56, 147);
    doc.rect(0, 0, 297, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("SINE JOÃO PESSOA - PAINEL DA EMPREGABILIDADE", 148.5, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(title.toUpperCase(), 148.5, 25, { align: 'center' });
    
    // Metadados do Relatório
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.text(`Exportado em: ${dateStr} às ${timeStr}`, 15, 42);
    doc.text(`Total de Oportunidades Filtradas: ${vagas.length}`, 15, 47);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 52, 282, 52);

    // Tabela Horizontal Profissional (Landscape)
    const tableHeaders = [["ID", "Cargo", "Qtd", "CBO", "Escolaridade", "Experiência", "Salário", "Benefícios", "Empresa", "Status"]];
    
    const tableData = vagas.map(v => [
      v.codigo || "-",
      v.descricao || "-",
      v.quantidade || "0",
      v.cbo || "-",
      v.escolaridade || "-",
      v.experiencia || "-",
      v.salario || "A combinar",
      v.beneficios || "-",
      v.empresa || "-",
      v.publicada ? "Ativa" : "Pausada"
    ]);

    doc.autoTable({
      startY: 55,
      head: tableHeaders,
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [0, 56, 147],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { 
        fontSize: 7, 
        cellPadding: 2,
        overflow: 'linebreak',
        font: 'helvetica',
        minCellHeight: 8
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' }, // ID/Código
        1: { cellWidth: 45, overflow: 'linebreak' }, // Cargo
        2: { cellWidth: 10, halign: 'center' }, // Qtd
        3: { cellWidth: 18, halign: 'center' }, // CBO
        4: { cellWidth: 35, overflow: 'linebreak' }, // Escolaridade
        5: { cellWidth: 25, overflow: 'linebreak' }, // Experiência
        6: { cellWidth: 25 },                   // Salário
        7: { cellWidth: 50, overflow: 'linebreak' }, // Benefícios
        8: { cellWidth: 30, overflow: 'linebreak' }, // Empresa
        9: { cellWidth: 15, halign: 'center' }  // Status
      },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      margin: { left: 10, right: 10 },
      didDrawPage: (data: any) => {
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        const str = `Página ${doc.internal.getNumberOfPages()} - Relatório Oficial SINE João Pessoa`;
        doc.text(str, 148.5, 205, { align: 'center' });
      }
    });

    return doc;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return null;
  }
};

/**
 * Generates and downloads a PDF file with institutional branding (Landscape A4).
 */
export const exportToPDF = (vagas: VagaLocal[], title: string, filename: string) => {
  const doc = generatePDF(vagas, title);
  if (doc) {
    doc.save(`${filename}.pdf`);
    toast.success("Relatório PDF exportado com sucesso");
  } else {
    toast.error("Falha ao gerar o relatório PDF.");
  }
};

/**
 * Specifically for Monthly History export
 */
export const exportHistoryToPDF = (item: HistoricoMensal) => {
  try {
    const allPublishedVagas: VagaLocal[] = [];
    
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
    
    const monthLabel = typeof item.month === 'number' 
      ? monthNames[item.month - 1] 
      : item.month;

    exportToPDF(
      allPublishedVagas, 
      `Relatório Consolidado: ${monthLabel} / ${item.year}`,
      `relatorio_vagas_${monthLabel.toLowerCase()}_${item.year}`
    );
  } catch (error) {
    console.error("Erro ao exportar histórico:", error);
    toast.error("Falha ao exportar relatório histórico.");
  }
};

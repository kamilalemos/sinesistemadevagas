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

export const exportToCSV = (vagas: VagaLocal[], filename: string) => {
  if (vagas.length === 0) {
    toast.error("Nenhuma vaga para exportar.");
    return;
  }

  const headers = ["ID", "Código", "CBO", "Descrição", "Quantidade", "Categoria", "Escolaridade", "Experiência", "Salário", "Empresa", "Benefícios", "Publicada", "Data Criada"];
  const csvContent = [
    headers.join(","),
    ...vagas.map(v => [
      v.id,
      v.codigo,
      v.cbo,
      `"${v.descricao}"`,
      v.quantidade,
      v.categoria,
      v.escolaridade,
      v.experiencia,
      v.salario,
      v.empresa,
      `"${v.beneficios}"`,
      v.publicada ? "Sim" : "Não",
      v.createdAt
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data: any, filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (vagas: VagaLocal[], title: string, filename: string) => {
  if (vagas.length === 0) {
    toast.error("Nenhuma vaga para exportar.");
    return;
  }

  const doc = new jsPDF();
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR');

  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("SINE - João Pessoa", 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text(title, 105, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em: ${dateStr} às ${timeStr}`, 105, 38, { align: 'center' });
  doc.text(`Total de Vagas: ${vagas.length}`, 105, 43, { align: 'center' });

  // Table
  const tableHeaders = [["Código", "Descrição", "Qtd", "Categoria", "Escolaridade"]];
  const tableData = vagas.map(v => [
    v.codigo,
    v.descricao,
    v.quantidade,
    v.categoria,
    v.escolaridade
  ]);

  doc.autoTable({
    startY: 50,
    head: tableHeaders,
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [0, 102, 204] },
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 50 }
  });

  doc.save(`${filename}.pdf`);
};

export const exportHistoryToPDF = (item: HistoricoMensal) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('pt-BR');
  
  doc.setFontSize(22);
  doc.text("SINE - João Pessoa", 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text(`Histórico Mensal: ${item.month}/${item.year}`, 105, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Backup consolidado em: ${new Date(item.consolidatedAt).toLocaleDateString('pt-BR')}`, 105, 38, { align: 'center' });
  doc.text(`Relatório gerado em: ${dateStr}`, 105, 43, { align: 'center' });

  let currentY = 55;

  // Published Vagas across all weeks
  const allVagas: VagaLocal[] = [];
  [1, 2, 3, 4].forEach(w => {
    const weekKey = `semana_${w}` as keyof typeof item.weeks;
    const weekVagas = item.weeks[weekKey]?.vagas?.filter(v => v.publicada) || [];
    allVagas.push(...weekVagas);
  });
  
  const feiraoVagas = item.feirao?.vagas?.filter(v => v.publicada) || [];
  allVagas.push(...feiraoVagas);

  if (allVagas.length === 0) {
    doc.text("Nenhuma vaga publicada encontrada neste histórico.", 105, currentY, { align: 'center' });
  } else {
    doc.autoTable({
      startY: currentY,
      head: [["Descrição", "Qtd", "Categoria", "Escolaridade"]],
      body: allVagas.map(v => [v.descricao, v.quantidade, v.categoria, v.escolaridade]),
      theme: 'grid',
      headStyles: { fillColor: [33, 33, 33] },
      styles: { fontSize: 8 }
    });
  }

  doc.save(`sine-historico-${item.month}-${item.year}.pdf`);
};

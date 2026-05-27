import { VagaLocal } from "@/types";

const categorias = ["Serviços", "Indústria", "Comércio", "Administrativo", "Vendas", "Transportes", "Tecnologia", "Saúde", "Educação"];
const escolaridades = ["Ensino Fundamental", "Ensino Médio Incompleto", "Ensino Médio Completo", "Técnico", "Superior Incompleto", "Superior Completo"];
const experiencias = ["Não exigida", "3 meses", "6 meses", "1 ano", "2 anos"];

export const generateFictitiousVagas = (count: number, periodo: string): VagaLocal[] => {
  const vagas: VagaLocal[] = [];
  
  for (let i = 1; i <= count; i++) {
    const categoria = categorias[Math.floor(Math.random() * categorias.length)];
    const cargoBase = [
      "Auxiliar", "Assistente", "Operador", "Vendedor", "Técnico", "Analista", "Gerente", "Coordenador"
    ][Math.floor(Math.random() * 8)];
    
    const area = [
      "de Estoque", "de Vendas", "de Limpeza", "de Manutenção", "Administrativo", "Comercial", "de TI", "de RH"
    ][Math.floor(Math.random() * 8)];

    vagas.push({
      id: crypto.randomUUID(),
      quantidade: Math.floor(Math.random() * 10) + 1,
      cbo: `${Math.floor(Math.random() * 9000) + 1000}-05`,
      descricao: `${cargoBase} ${area} (Fictícia #${i})`,
      escolaridade: escolaridades[Math.floor(Math.random() * escolaridades.length)],
      experiencia: experiencias[Math.floor(Math.random() * experiencias.length)],
      codigo: `MAI26-${100 + i}`,
      beneficios: "VT + VR + Plano de Saúde",
      salario: `R$ ${ (Math.random() * 3000 + 1412).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }`,
      empresa: `Empresa Parceira ${String.fromCharCode(65 + (i % 26))}`,
      publicada: true,
      categoria: categoria,
      periodo: periodo,
      createdAt: new Date().toISOString()
    });
  }
  
  return vagas;
};

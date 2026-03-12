import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Vaga {
  qtd: number;
  cbo?: string;
  cargo: string;
  escolaridade: string;
  experiencia: string;
  descricao: string;
  categoria?: string;
}

export interface VagasData {
  vagas: Vaga[];
  totalVagas: number;
  periodoInicio: string;
  periodoFim: string;
  updatedAt: string;
}

export interface FeiraoData {
  vagas: Vaga[];
  totalVagas: number;
  titulo: string;
  updatedAt: string;
}

interface VagasStore {
  vagasSemana: VagasData;
  feirao: FeiraoData;
  setVagasSemana: (data: VagasData) => void;
  setFeirao: (data: FeiraoData) => void;
}

const mockVagas: Vaga[] = [
  { qtd: 45, cargo: "Desenvolvedor Full Stack", escolaridade: "Superior Completo", experiencia: "2 anos", descricao: "Desenvolvimento de aplicações web", categoria: "Tecnologia" },
  { qtd: 30, cargo: "Assistente Administrativo", escolaridade: "Médio Completo", experiencia: "1 ano", descricao: "Rotinas administrativas e atendimento", categoria: "Administrativo" },
  { qtd: 60, cargo: "Vendedor Externo", escolaridade: "Médio Completo", experiencia: "6 meses", descricao: "Vendas externas e prospecção de clientes", categoria: "Vendas" },
  { qtd: 25, cargo: "Analista de Marketing Digital", escolaridade: "Superior Completo", experiencia: "1 ano", descricao: "Gestão de campanhas digitais", categoria: "Marketing" },
  { qtd: 80, cargo: "Auxiliar de Serviços Gerais", escolaridade: "Fundamental", experiencia: "Não exigida", descricao: "Limpeza e conservação", categoria: "Serviços" },
  { qtd: 55, cargo: "Motorista de Entregas", escolaridade: "Médio Completo", experiencia: "1 ano", descricao: "Entrega de mercadorias na região", categoria: "Logística" },
  { qtd: 70, cargo: "Operador de Produção", escolaridade: "Médio Completo", experiencia: "6 meses", descricao: "Operação de máquinas industriais", categoria: "Indústria" },
  { qtd: 35, cargo: "Recepcionista", escolaridade: "Médio Completo", experiencia: "6 meses", descricao: "Atendimento ao público", categoria: "Administrativo" },
  { qtd: 20, cargo: "Técnico em Informática", escolaridade: "Técnico", experiencia: "1 ano", descricao: "Suporte técnico e manutenção", categoria: "Tecnologia" },
  { qtd: 40, cargo: "Cozinheiro", escolaridade: "Fundamental", experiencia: "1 ano", descricao: "Preparo de refeições", categoria: "Serviços" },
  { qtd: 34, cargo: "Auxiliar de Logística", escolaridade: "Médio Completo", experiencia: "6 meses", descricao: "Controle de estoque e expedição", categoria: "Logística" },
];

export const useVagasStore = create<VagasStore>()(
  persist(
    (set) => ({
      vagasSemana: {
        vagas: mockVagas,
        totalVagas: mockVagas.reduce((sum, v) => sum + v.qtd, 0),
        periodoInicio: "09/03/2026",
        periodoFim: "13/03/2026",
        updatedAt: new Date().toISOString(),
      },
      feirao: {
        vagas: mockVagas.slice(0, 5),
        totalVagas: mockVagas.slice(0, 5).reduce((sum, v) => sum + v.qtd, 0),
        titulo: "Feirão da Empregabilidade 2026",
        updatedAt: new Date().toISOString(),
      },
      setVagasSemana: (data) => set({ vagasSemana: data }),
      setFeirao: (data) => set({ feirao: data }),
    }),
    { name: 'vagas-storage' }
  )
);

export const categorias = [
  { nome: "Tecnologia", icone: "Monitor" },
  { nome: "Administrativo", icone: "Briefcase" },
  { nome: "Vendas", icone: "ShoppingCart" },
  { nome: "Marketing", icone: "Megaphone" },
  { nome: "Serviços", icone: "Wrench" },
  { nome: "Logística", icone: "Truck" },
  { nome: "Indústria", icone: "Factory" },
] as const;

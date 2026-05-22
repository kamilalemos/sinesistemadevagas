import { create } from 'zustand';
import { 
  loadVagasFromLocalStorage, 
  saveVagasToLocalStorage 
} from '@/lib/vagasPersistence';
import { VagaLocal } from '@/types';

export type { VagaLocal };

interface VagasState {
  vagas_semana: VagaLocal[];
  vagas_feirao: VagaLocal[];
  semana_ativa: boolean;
  feirao_ativa: boolean;
  periodo_semana: string;
  periodo_feirao: string;
  addVaga: (tipo: 'semana' | 'feirao', vaga: Omit<VagaLocal, 'id' | 'createdAt'>) => void;
  updateVaga: (tipo: 'semana' | 'feirao', id: string, vaga: Partial<VagaLocal>) => void;
  deleteVaga: (tipo: 'semana' | 'feirao', id: string) => void;
  setVisibilidade: (tipo: 'semana' | 'feirao', ativa: boolean) => void;
  setPeriodo: (tipo: 'semana' | 'feirao', periodo: string) => void;
  refreshFromStorage: () => void;
}

// Initial load
const initialSemana = loadVagasFromLocalStorage('semana');
const initialFeirao = loadVagasFromLocalStorage('feirao');

const mockVagas: Omit<VagaLocal, 'id' | 'createdAt'>[] = [
  {
    quantidade: 2,
    cbo: "4110-05",
    descricao: "Auxiliar Administrativo",
    escolaridade: "Ensino Médio Completo",
    experiencia: "6 meses",
    codigo: "7283492",
    beneficios: "VT + VR + Plano de Saúde",
    salario: "R$ 1.650,00",
    empresa: "Empresa de Logística",
    categoria: "Serviços",
    periodo: initialSemana.periodo,
    publicada: true,
  },
  {
    quantidade: 5,
    cbo: "4211-10",
    descricao: "Operador de Caixa",
    escolaridade: "Ensino Médio Completo",
    experiencia: "Não exigida",
    codigo: "8192304",
    beneficios: "VT + Quebra de Caixa",
    salario: "R$ 1.520,00",
    empresa: "Supermercado Local",
    categoria: "Comércio",
    periodo: initialSemana.periodo,
    publicada: true,
  },
  {
    quantidade: 3,
    cbo: "5141-20",
    descricao: "Atendente de Loja",
    escolaridade: "Ensino Médio Incompleto",
    experiencia: "Desejável",
    codigo: "9023412",
    beneficios: "VT + Bonificação",
    salario: "R$ 1.412,00",
    empresa: "Loja de Shopping",
    categoria: "Vendas",
    periodo: initialSemana.periodo,
    publicada: true,
  },
  {
    quantidade: 1,
    cbo: "7823-10",
    descricao: "Motorista de Entrega",
    escolaridade: "Ensino Fundamental",
    experiencia: "1 ano (CNH D)",
    codigo: "3489210",
    beneficios: "Diárias + Seguro",
    salario: "R$ 2.400,00",
    empresa: "Distribuidora de Alimentos",
    categoria: "Transportes",
    periodo: initialSemana.periodo,
    publicada: true,
  },
  {
    quantidade: 1,
    cbo: "3171-10",
    descricao: "Técnico de Informática",
    escolaridade: "Curso Técnico ou Superior",
    experiencia: "6 meses comprovados",
    codigo: "5582910",
    beneficios: "Notebook + Auxílio Internet",
    salario: "R$ 2.800,00",
    empresa: "Empresa de Tecnologia",
    categoria: "Tecnologia",
    periodo: initialSemana.periodo,
    publicada: true,
  },
  {
    quantidade: 8,
    cbo: "5143-20",
    descricao: "Auxiliar de Serviços Gerais",
    escolaridade: "Ensino Fundamental",
    experiencia: "Não exigida",
    codigo: "2293841",
    beneficios: "Cesta Básica",
    salario: "R$ 1.412,00",
    empresa: "Condomínio Comercial",
    categoria: "Serviços",
    periodo: initialSemana.periodo,
    publicada: true,
  },
  {
    quantidade: 4,
    cbo: "5211-10",
    descricao: "Vendedor Interno",
    escolaridade: "Ensino Médio Completo",
    experiencia: "6 meses",
    codigo: "6612930",
    beneficios: "Comissão + VT",
    salario: "R$ 1.600,00 + Comissões",
    empresa: "Comércio de Ferragens",
    categoria: "Vendas",
    periodo: initialSemana.periodo,
    publicada: true,
  },
  {
    quantidade: 1,
    cbo: "4221-05",
    descricao: "Recepcionista",
    escolaridade: "Ensino Médio Completo",
    experiencia: "Desejável Inglês",
    codigo: "1192834",
    beneficios: "Plano Odontológico",
    salario: "R$ 1.800,00",
    empresa: "Clínica Médica",
    categoria: "Atendimento",
    periodo: initialSemana.periodo,
    publicada: true,
  },
  {
    quantidade: 2,
    cbo: "4141-05",
    descricao: "Estoquista",
    escolaridade: "Ensino Médio",
    experiencia: "Não exigida",
    codigo: "4472819",
    beneficios: "Auxílio Alimentação",
    salario: "R$ 1.550,00",
    empresa: "Depósito de Construção",
    categoria: "Logística",
    periodo: initialSemana.periodo,
    publicada: true,
  },
  {
    quantidade: 10,
    cbo: "0000-00",
    descricao: "Jovem Aprendiz",
    escolaridade: "Cursando Ensino Médio",
    experiencia: "Nenhuma (Primeiro Emprego)",
    codigo: "0019283",
    beneficios: "Curso de Capacitação",
    salario: "R$ 800,00",
    empresa: "Empresa Parceira SINE",
    categoria: "Administração",
    periodo: initialSemana.periodo,
    publicada: true,
  }
];

export const useVagasLocalStore = create<VagasState>((set) => ({
  vagas_semana: initialSemana.vagas.length === 0 ? mockVagas.map(v => ({...v, id: crypto.randomUUID(), createdAt: new Date().toISOString()})) : initialSemana.vagas,
  vagas_feirao: initialFeirao.vagas,
  semana_ativa: true,
  feirao_ativa: true,
  periodo_semana: initialSemana.periodo,
  periodo_feirao: initialFeirao.periodo,
  
  refreshFromStorage: () => {
    const sem = loadVagasFromLocalStorage('semana');
    const fei = loadVagasFromLocalStorage('feirao');
    
    // Auto-seed if empty even on refresh
    let finalVagasSemana = sem.vagas;
    if (sem.vagas.length === 0) {
      finalVagasSemana = mockVagas.map(v => ({
        ...v, 
        id: crypto.randomUUID(), 
        createdAt: new Date().toISOString()
      }));
      saveVagasToLocalStorage('semana', finalVagasSemana, sem.periodo);
    }

    set({
      vagas_semana: finalVagasSemana,
      vagas_feirao: fei.vagas,
      periodo_semana: sem.periodo,
      periodo_feirao: fei.periodo
    });
  },

  addVaga: (tipo, vagaData) => set((state) => {
    const newVaga: VagaLocal = {
      ...vagaData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const key = tipo === 'semana' ? 'vagas_semana' : 'vagas_feirao';
    const periodKey = tipo === 'semana' ? 'periodo_semana' : 'periodo_feirao';
    const newState = { [key]: [newVaga, ...state[key]] };
    
    // Auto-save to localStorage with the correct key
    saveVagasToLocalStorage(tipo, newState[key] as VagaLocal[], state[periodKey]);
    
    return newState;
  }),

  updateVaga: (tipo, id, vagaData) => set((state) => {
    const key = tipo === 'semana' ? 'vagas_semana' : 'vagas_feirao';
    const periodKey = tipo === 'semana' ? 'periodo_semana' : 'periodo_feirao';
    const updatedVagas = state[key].map((v) => (v.id === id ? { ...v, ...vagaData } : v));
    const newState = { [key]: updatedVagas };
    
    saveVagasToLocalStorage(tipo, updatedVagas, state[periodKey]);
    
    return newState;
  }),

  deleteVaga: (tipo, id) => set((state) => {
    const key = tipo === 'semana' ? 'vagas_semana' : 'vagas_feirao';
    const periodKey = tipo === 'semana' ? 'periodo_semana' : 'periodo_feirao';
    const filteredVagas = state[key].filter((v) => v.id !== id);
    const newState = { [key]: filteredVagas };
    
    saveVagasToLocalStorage(tipo, filteredVagas, state[periodKey]);
    
    return newState;
  }),

  setVisibilidade: (tipo, ativa) => set((state) => ({
    [tipo === 'semana' ? 'semana_ativa' : 'feirao_ativa']: ativa
  })),

  setPeriodo: (tipo, periodo) => set((state) => {
    const key = tipo === 'semana' ? 'vagas_semana' : 'vagas_feirao';
    const periodKey = tipo === 'semana' ? 'periodo_semana' : 'periodo_feirao';
    const newState = { [periodKey]: periodo };
    
    saveVagasToLocalStorage(tipo, state[key], periodo);
    
    return newState;
  }),
}));

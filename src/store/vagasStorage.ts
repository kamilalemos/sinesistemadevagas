import { create } from 'zustand';
import { 
  loadVagasFromLocalStorage, 
  saveVagasToLocalStorage 
} from '@/lib/vagasPersistence';
import { VagaLocal, VagasArraySchema } from '@/types';
import { logAudit } from '@/services/auditService';

export type { VagaLocal };

// Valida um array de vagas vindo do localStorage. Se corrompido, retorna [].
function validateVagas(vagas: unknown, label: string): VagaLocal[] {
  const result = VagasArraySchema.safeParse(vagas);
  if (!result.success) {
    console.warn(`[sine] Dados corrompidos em ${label} — resetando.`, result.error.issues);
    return [];
  }
  return result.data as VagaLocal[];
}

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
  resetVagas: (tipo: 'semana' | 'feirao', novoPeriodo?: string) => void;
}

// Initial load
const initialSemana = loadVagasFromLocalStorage('semana');
const initialFeirao = loadVagasFromLocalStorage('feirao');

const mockVagas: Omit<VagaLocal, 'id' | 'createdAt'>[] = [
  {
    quantidade: 4,
    cbo: "4110-05",
    descricao: "Auxiliar Administrativo - SINE",
    escolaridade: "Ensino Médio Completo",
    experiencia: "6 meses",
    codigo: "MAI2026-01",
    beneficios: "VT + VR + Plano de Saúde",
    salario: "R$ 1.850,00",
    empresa: "Confidencial",
    categoria: "Administrativo",
    periodo: "18/05 a 22/05",
    publicada: true,
  },
  {
    quantidade: 12,
    cbo: "4211-10",
    descricao: "Operador de Caixa (Vagas Maio)",
    escolaridade: "Ensino Médio Completo",
    experiencia: "Não exigida",
    codigo: "MAI2026-02",
    beneficios: "VT + Quebra de Caixa + Alimentação",
    salario: "R$ 1.580,00",
    empresa: "Rede de Supermercados",
    categoria: "Comércio",
    periodo: "18/05 a 22/05",
    publicada: true,
  },
  {
    quantidade: 6,
    cbo: "5141-20",
    descricao: "Atendente de Loja - Shopping",
    escolaridade: "Ensino Médio Incompleto",
    experiencia: "Desejável",
    codigo: "MAI2026-03",
    beneficios: "VT + Bonificação por Metas",
    salario: "R$ 1.412,00 + Comissões",
    empresa: "Varejo Nacional",
    categoria: "Vendas",
    periodo: "18/05 a 22/05",
    publicada: true,
  },
  {
    quantidade: 2,
    cbo: "7823-10",
    descricao: "Motorista de Entrega CNH D",
    escolaridade: "Ensino Fundamental",
    experiencia: "1 ano",
    codigo: "MAI2026-04",
    beneficios: "Diárias + Plano de Carreira",
    salario: "R$ 2.650,00",
    empresa: "Logística Express",
    categoria: "Transportes",
    periodo: "18/05 a 22/05",
    publicada: true,
  },
  {
    quantidade: 3,
    cbo: "3171-10",
    descricao: "Suporte Técnico Nível 1",
    escolaridade: "Técnico em Informática",
    experiencia: "6 meses",
    codigo: "MAI2026-05",
    beneficios: "Home Office Híbrido + Auxílio",
    salario: "R$ 2.900,00",
    empresa: "Tech Solutions",
    categoria: "Tecnologia",
    periodo: "18/05 a 22/05",
    publicada: true,
  },
  {
    quantidade: 15,
    cbo: "5143-20",
    descricao: "Auxiliar de Limpeza e Conservação",
    escolaridade: "Ensino Fundamental",
    experiencia: "Não exigida",
    codigo: "MAI2026-06",
    beneficios: "Cesta Básica + VT",
    salario: "R$ 1.412,00",
    empresa: "Facility Services",
    categoria: "Serviços",
    periodo: "18/05 a 22/05",
    publicada: true,
  },
  {
    quantidade: 5,
    cbo: "5211-10",
    descricao: "Vendedor Externo Porta a Porta",
    escolaridade: "Ensino Médio Completo",
    experiencia: "6 meses",
    codigo: "MAI2026-07",
    beneficios: "Altas Comissões + Ajuda de Custo",
    salario: "R$ 1.500,00 + Variável",
    empresa: "Telecom JP",
    categoria: "Vendas",
    periodo: "18/05 a 22/05",
    publicada: true,
  },
  {
    quantidade: 2,
    cbo: "4221-05",
    descricao: "Recepcionista Bilíngue",
    escolaridade: "Ensino Médio Completo",
    experiencia: "Inglês Fluente",
    codigo: "MAI2026-08",
    beneficios: "Plano Odontológico + VR",
    salario: "R$ 2.200,00",
    empresa: "Hotelaria Prime",
    categoria: "Atendimento",
    periodo: "18/05 a 22/05",
    publicada: true,
  },
  {
    quantidade: 8,
    cbo: "4141-05",
    descricao: "Estoquista de Depósito",
    escolaridade: "Ensino Médio",
    experiencia: "3 meses",
    codigo: "MAI2026-09",
    beneficios: "Seguro de Vida + Almoço no Local",
    salario: "R$ 1.620,00",
    empresa: "Atacado Distribuição",
    categoria: "Logística",
    periodo: "18/05 a 22/05",
    publicada: true,
  },
  {
    quantidade: 20,
    cbo: "0000-00",
    descricao: "Programa Jovem Aprendiz SINE",
    escolaridade: "Cursando Ensino Médio",
    experiencia: "Sem experiência",
    codigo: "MAI2026-10",
    beneficios: "Curso Gratuito + Meio Período",
    salario: "R$ 880,00",
    empresa: "Prefeitura João Pessoa",
    categoria: "Administração",
    periodo: "18/05 a 22/05",
    publicada: true,
  }
];

export const useVagasLocalStore = create<VagasState>((set) => ({
  vagas_semana: validateVagas(initialSemana.vagas, 'vagas_semana').length === 0
    ? mockVagas.map(v => ({...v, id: crypto.randomUUID(), createdAt: new Date().toISOString()}))
    : validateVagas(initialSemana.vagas, 'vagas_semana'),
  vagas_feirao: validateVagas(initialFeirao.vagas, 'vagas_feirao'),
  semana_ativa: true,
  feirao_ativa: true,
  periodo_semana: initialSemana.periodo,
  periodo_feirao: initialFeirao.periodo,
  
  refreshFromStorage: () => {
    const sem = loadVagasFromLocalStorage('semana');
    const fei = loadVagasFromLocalStorage('feirao');
    
    // Validar dados antes de usar
    let finalVagasSemana = validateVagas(sem.vagas, 'vagas_semana');
    const finalVagasFeirao = validateVagas(fei.vagas, 'vagas_feirao');

    // Auto-seed if empty even on refresh
    if (finalVagasSemana.length === 0) {
      finalVagasSemana = mockVagas.map(v => ({
        ...v, 
        id: crypto.randomUUID(), 
        createdAt: new Date().toISOString()
      }));
      saveVagasToLocalStorage('semana', finalVagasSemana, sem.periodo);
    }

    set({
      vagas_semana: finalVagasSemana,
      vagas_feirao: finalVagasFeirao,
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
    logAudit('create', 'vaga', newVaga.id, { tipo, descricao: newVaga.descricao });
    
    return newState;
  }),

  updateVaga: (tipo, id, vagaData) => set((state) => {
    const key = tipo === 'semana' ? 'vagas_semana' : 'vagas_feirao';
    const periodKey = tipo === 'semana' ? 'periodo_semana' : 'periodo_feirao';
    const updatedVagas = state[key].map((v) => (v.id === id ? { ...v, ...vagaData } : v));
    const newState = { [key]: updatedVagas };
    
    saveVagasToLocalStorage(tipo, updatedVagas, state[periodKey]);
    logAudit('update', 'vaga', id, { tipo, changes: vagaData });
    
    return newState;
  }),

  deleteVaga: (tipo, id) => set((state) => {
    const key = tipo === 'semana' ? 'vagas_semana' : 'vagas_feirao';
    const periodKey = tipo === 'semana' ? 'periodo_semana' : 'periodo_feirao';
    const filteredVagas = state[key].filter((v) => v.id !== id);
    const newState = { [key]: filteredVagas };
    
    saveVagasToLocalStorage(tipo, filteredVagas, state[periodKey]);
    logAudit('delete', 'vaga', id, { tipo });
    
    return newState;
  }),

  setVisibilidade: (tipo, ativa) => set((state) => {
    logAudit('publish', 'periodo', tipo, { ativa });
    return {
      [tipo === 'semana' ? 'semana_ativa' : 'feirao_ativa']: ativa
    };
  }),

  setPeriodo: (tipo, periodo) => set((state) => {
    const key = tipo === 'semana' ? 'vagas_semana' : 'vagas_feirao';
    const periodKey = tipo === 'semana' ? 'periodo_semana' : 'periodo_feirao';
    const newState = { [periodKey]: periodo };
    
    saveVagasToLocalStorage(tipo, state[key], periodo);
    
    return newState;
  }),

  resetVagas: (tipo, novoPeriodo) => set((state) => {
    const key = tipo === 'semana' ? 'vagas_semana' : 'vagas_feirao';
    const periodKey = tipo === 'semana' ? 'periodo_semana' : 'periodo_feirao';
    
    // 1. Garantir que as vagas atuais sejam salvas no localStorage (e consequentemente no backup mensal)
    // O saveVagasToLocalStorage agora chama o backup mensal automaticamente.
    saveVagasToLocalStorage(tipo, state[key], state[periodKey]);
    
    logAudit('reset', 'periodo', tipo, { 
      novoPeriodo, 
      vagasArquivadas: state[key].length 
    });
    
    // 2. Limpar o estado local para o novo período
    const newState = { 
      [key]: [],
      [periodKey]: novoPeriodo || "" 
    };
    
    // 3. Salvar o novo estado vazio para refletir a limpeza no storage
    saveVagasToLocalStorage(tipo, [], novoPeriodo || "");
    
    return newState;
  }),
}));

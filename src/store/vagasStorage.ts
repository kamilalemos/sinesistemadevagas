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

export const useVagasLocalStore = create<VagasState>((set) => ({
  vagas_semana: initialSemana.vagas,
  vagas_feirao: initialFeirao.vagas,
  semana_ativa: true,
  feirao_ativa: true,
  periodo_semana: initialSemana.periodo,
  periodo_feirao: initialFeirao.periodo,
  
  refreshFromStorage: () => {
    const sem = loadVagasFromLocalStorage('semana');
    const fei = loadVagasFromLocalStorage('feirao');
    set({
      vagas_semana: sem.vagas,
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

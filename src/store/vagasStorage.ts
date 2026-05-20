import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface VagaLocal {
  id: string;
  quantidade: number;
  cbo: string;
  descricao: string;
  escolaridade: string;
  experiencia: string;
  codigo: string;
  beneficios: string;
  salario: string;
  empresa: string;
  publicada: boolean;
  categoria: string;
  createdAt: string;
}

interface VagasState {
  vagas_semana: VagaLocal[];
  vagas_feirao: VagaLocal[];
  addVaga: (tipo: 'semana' | 'feirao', vaga: Omit<VagaLocal, 'id' | 'createdAt'>) => void;
  updateVaga: (tipo: 'semana' | 'feirao', id: string, vaga: Partial<VagaLocal>) => void;
  deleteVaga: (tipo: 'semana' | 'feirao', id: string) => void;
}

export const useVagasLocalStore = create<VagasState>()(
  persist(
    (set) => ({
      vagas_semana: [],
      vagas_feirao: [],
      addVaga: (tipo, vagaData) => set((state) => {
        const newVaga: VagaLocal = {
          ...vagaData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        const key = tipo === 'semana' ? 'vagas_semana' : 'vagas_feirao';
        return { [key]: [newVaga, ...state[key]] };
      }),
      updateVaga: (tipo, id, vagaData) => set((state) => {
        const key = tipo === 'semana' ? 'vagas_semana' : 'vagas_feirao';
        return {
          [key]: state[key].map((v) => (v.id === id ? { ...v, ...vagaData } : v)),
        };
      }),
      deleteVaga: (tipo, id) => set((state) => {
        const key = tipo === 'semana' ? 'vagas_semana' : 'vagas_feirao';
        return {
          [key]: state[key].filter((v) => v.id !== id),
        };
      }),
    }),
    {
      name: 'vagas-storage-local',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

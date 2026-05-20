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
  semana_ativa: boolean;
  feirao_ativa: boolean;
  periodo_semana: string;
  periodo_feirao: string;
  addVaga: (tipo: 'semana' | 'feirao', vaga: Omit<VagaLocal, 'id' | 'createdAt'>) => void;
  updateVaga: (tipo: 'semana' | 'feirao', id: string, vaga: Partial<VagaLocal>) => void;
  deleteVaga: (tipo: 'semana' | 'feirao', id: string) => void;
  setVisibilidade: (tipo: 'semana' | 'feirao', ativa: boolean) => void;
  setPeriodo: (tipo: 'semana' | 'feirao', periodo: string) => void;
}

export const useVagasLocalStore = create<VagasState>()(
  persist(
    (set) => ({
      vagas_semana: [],
      vagas_feirao: [],
      semana_ativa: true,
      feirao_ativa: true,
      periodo_semana: "Próxima Semana",
      periodo_feirao: "Próximo Feirão",
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
      setVisibilidade: (tipo, ativa) => set((state) => ({
        [tipo === 'semana' ? 'semana_ativa' : 'feirao_ativa']: ativa
      })),
      setPeriodo: (tipo, periodo) => set((state) => ({
        [tipo === 'semana' ? 'periodo_semana' : 'periodo_feirao']: periodo
      })),
    }),
    {
      name: 'vagas-storage-local',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

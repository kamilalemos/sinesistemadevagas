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
  periodo: string;
  createdAt: string;
}

export type SemanaTipo = 'semana1' | 'semana2' | 'semana3' | 'semana4' | 'feirao';

interface MesBackup {
  mes: string; // Format: YYYY-MM
  vagas: Record<SemanaTipo, VagaLocal[]>;
  timestamp: string;
}

interface VagasState {
  // Dados do mês atual
  mes_atual: string; // YYYY-MM
  vagas: Record<SemanaTipo, VagaLocal[]>;
  semana_ativa: SemanaTipo;
  periodos: Record<SemanaTipo, string>;
  
  // Histórico e Backups
  historico: MesBackup[];
  
  // Ações
  addVaga: (semana: SemanaTipo, vaga: Omit<VagaLocal, 'id' | 'createdAt'>) => void;
  updateVaga: (semana: SemanaTipo, id: string, vaga: Partial<VagaLocal>) => void;
  deleteVaga: (semana: SemanaTipo, id: string) => void;
  setSemanaAtiva: (semana: SemanaTipo) => void;
  setPeriodo: (semana: SemanaTipo, periodo: string) => void;
  gerarBackup: () => void;
  encerrarMes: () => void;
  restaurarMes: (backup: MesBackup) => void;
}

const getMesAtualKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const useVagasLocalStore = create<VagasState>()(
  persist(
    (set, get) => ({
      mes_atual: getMesAtualKey(),
      vagas: {
        semana1: [],
        semana2: [],
        semana3: [],
        semana4: [],
        feirao: [],
      },
      semana_ativa: 'semana1',
      periodos: {
        semana1: "Semana 1",
        semana2: "Semana 2",
        semana3: "Semana 3",
        semana4: "Semana 4",
        feirao: "Feirão",
      },
      historico: [],

      addVaga: (semana, vagaData) => set((state) => {
        const newVaga: VagaLocal = {
          ...vagaData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        const novasVagas = { ...state.vagas };
        novasVagas[semana] = [newVaga, ...novasVagas[semana]];
        return { vagas: novasVagas };
      }),

      updateVaga: (semana, id, vagaData) => set((state) => {
        const novasVagas = { ...state.vagas };
        novasVagas[semana] = novasVagas[semana].map((v) => 
          v.id === id ? { ...v, ...vagaData } : v
        );
        return { vagas: novasVagas };
      }),

      deleteVaga: (semana, id) => set((state) => {
        const novasVagas = { ...state.vagas };
        novasVagas[semana] = novasVagas[semana].filter((v) => v.id !== id);
        return { vagas: novasVagas };
      }),

      setSemanaAtiva: (semana) => set({ semana_ativa: semana }),

      setPeriodo: (semana, periodo) => set((state) => ({
        periodos: { ...state.periodos, [semana]: periodo }
      })),

      gerarBackup: () => {
        const state = get();
        const backup: MesBackup = {
          mes: state.mes_atual,
          vagas: JSON.parse(JSON.stringify(state.vagas)),
          timestamp: new Date().toISOString(),
        };
        
        set((state) => {
          // Evitar duplicatas de backup para o mesmo mês
          const novoHistorico = state.historico.filter(b => b.mes !== backup.mes);
          return { historico: [backup, ...novoHistorico] };
        });
      },

      encerrarMes: () => {
        const state = get();
        state.gerarBackup();
        
        const nextMes = new Date();
        nextMes.setMonth(nextMes.getMonth() + 1);
        const mesKey = `${nextMes.getFullYear()}-${String(nextMes.getMonth() + 1).padStart(2, '0')}`;
        
        set({
          mes_atual: mesKey,
          vagas: {
            semana1: [],
            semana2: [],
            semana3: [],
            semana4: [],
            feirao: [],
          },
          semana_ativa: 'semana1'
        });
      },

      restaurarMes: (backup) => set({
        vagas: JSON.parse(JSON.stringify(backup.vagas)),
        mes_atual: backup.mes
      }),
    }),
    {
      name: 'sine-vagas-pro-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
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

export interface BackupMensal {
  mes: string;
  ano: string;
  vagas_semanas: { [semana: string]: VagaLocal[] };
  vagas_feirao: VagaLocal[];
  data_backup: string;
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
  getHistórico: () => BackupMensal[];
  triggerManualBackup: () => void;
}

const getSemanaAtual = (dia: number) => {
  if (dia <= 7) return 1;
  if (dia <= 14) return 2;
  if (dia <= 21) return 3;
  return 4;
};

const getStorageKeys = () => {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const dia = now.getDate();
  const semana = getSemanaAtual(dia);

  return {
    semanaKey: `sine_vagas_${ano}_${mes}_semana_${semana}`,
    feiraoKey: `sine_feirao_${ano}_${mes}`,
    backupKey: `sine_backup_${ano}_${mes}`,
    mes,
    ano,
    semana
  };
};

const saveToLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const loadFromLocal = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const createMonthlyBackup = (mes: string, ano: string): BackupMensal => {
  const backup: BackupMensal = {
    mes,
    ano,
    vagas_semanas: {},
    vagas_feirao: loadFromLocal(`sine_feirao_${ano}_${mes}`) || [],
    data_backup: new Date().toISOString()
  };

  for (let i = 1; i <= 4; i++) {
    backup.vagas_semanas[`semana_${i}`] = loadFromLocal(`sine_vagas_${ano}_${mes}_semana_${i}`) || [];
  }

  return backup;
};

export const useVagasLocalStore = create<VagasState>()(
  persist(
    (set, get) => ({
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
        
        const { semanaKey, feiraoKey, mes, ano, semana } = getStorageKeys();
        const key = tipo === 'semana' ? 'vagas_semana' : 'vagas_feirao';
        const storageKey = tipo === 'semana' ? semanaKey : feiraoKey;
        
        const currentVagas = state[key];
        const newState = { [key]: [newVaga, ...currentVagas] };
        saveToLocal(storageKey, newState[key]);

        if (semana === 4) {
          const backup = createMonthlyBackup(mes, String(ano));
          saveToLocal(`sine_backup_${ano}_${mes}`, backup);
        }

        return newState;
      }),

      updateVaga: (tipo, id, vagaData) => set((state) => {
        const { semanaKey, feiraoKey } = getStorageKeys();
        const key = tipo === 'semana' ? 'vagas_semana' : 'vagas_feirao';
        const storageKey = tipo === 'semana' ? semanaKey : feiraoKey;
        
        const newVagas = state[key].map((v) => (v.id === id ? { ...v, ...vagaData } : v));
        saveToLocal(storageKey, newVagas);
        
        return { [key]: newVagas };
      }),

      deleteVaga: (tipo, id) => set((state) => {
        const { semanaKey, feiraoKey } = getStorageKeys();
        const key = tipo === 'semana' ? 'vagas_semana' : 'vagas_feirao';
        const storageKey = tipo === 'semana' ? semanaKey : feiraoKey;
        
        const newVagas = state[key].filter((v) => v.id !== id);
        saveToLocal(storageKey, newVagas);
        
        return { [key]: newVagas };
      }),

      setVisibilidade: (tipo, ativa) => set((state) => ({
        [tipo === 'semana' ? 'semana_ativa' : 'feirao_ativa']: ativa
      })),

      setPeriodo: (tipo, periodo) => set((state) => ({
        [tipo === 'semana' ? 'periodo_semana' : 'periodo_feirao']: periodo
      })),

      getHistórico: () => {
        const backups: BackupMensal[] = [];
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith('sine_backup_')) {
            try {
              const data = loadFromLocal(key);
              if (data && data.mes && data.ano) backups.push(data);
            } catch (e) {
              console.error("Erro ao carregar backup:", key, e);
            }
          }
        }
        return backups.sort((a, b) => {
            const dateA = new Date(`${a.ano}-${a.mes}-01`).getTime();
            const dateB = new Date(`${b.ano}-${b.mes}-01`).getTime();
            return dateB - dateA;
        });
      },

      triggerManualBackup: () => {
        const { mes, ano } = getStorageKeys();
        const backup = createMonthlyBackup(mes, String(ano));
        saveToLocal(`sine_backup_${ano}_${mes}`, backup);
      }
    }),
    {
      name: 'vagas-storage-local',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { semanaKey, feiraoKey, mes, ano, semana } = getStorageKeys();
          
          const savedSemana = loadFromLocal(semanaKey);
          const savedFeirao = loadFromLocal(feiraoKey);
          
          if (savedSemana) state.vagas_semana = savedSemana;
          else state.vagas_semana = []; // Limpa se for nova semana e não houver dados
          
          if (savedFeirao) state.vagas_feirao = savedFeirao;
          // Não limpa o feirão pois ele é mensal

          // Verificar se precisa de backup inicial na última semana
          if (semana === 4) {
            const existingBackup = loadFromLocal(`sine_backup_${ano}_${mes}`);
            if (!existingBackup) {
              const backup = createMonthlyBackup(mes, String(ano));
              saveToLocal(`sine_backup_${ano}_${mes}`, backup);
            }
          }
        }
      }
    }
  )
);

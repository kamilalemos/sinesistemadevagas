import { VagaLocal, HistoricoMensal } from '@/types';
import { generateStorageKey, saveData, loadData } from '@/services/storage';

const APP_PREFIX = 'sine';

export const getWeekInfo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = now.getDate();
  
  let week = 1;
  if (day >= 8 && day <= 14) week = 2;
  else if (day >= 15 && day <= 21) week = 3;
  else if (day >= 22) week = 4;
  
  return {
    year,
    month,
    week,
    vagasKey: generateStorageKey(APP_PREFIX, 'vagas', year, month, 'semana', week),
    feiraoKey: generateStorageKey(APP_PREFIX, 'feirao', year, month),
    backupKey: generateStorageKey(APP_PREFIX, 'backup', year, month),
    monthYear: `${year}_${month}`
  };
};

export const saveVagasToLocalStorage = (tipo: 'semana' | 'feirao', vagas: VagaLocal[], periodo: string) => {
  const info = getWeekInfo();
  // Se for semana, usamos a chave específica da semana (1, 2, 3 ou 4)
  const key = tipo === 'semana' ? info.vagasKey : info.feiraoKey;
  const dataToSave = { vagas, periodo };
  
  saveData(key, dataToSave);
  
  // Sempre atualiza o backup mensal ao salvar qualquer vaga
  performMonthlyBackup(info.year, info.month);
};

export const loadVagasFromLocalStorage = (tipo: 'semana' | 'feirao'): { vagas: VagaLocal[], periodo: string } => {
  const info = getWeekInfo();
  const key = tipo === 'semana' ? info.vagasKey : info.feiraoKey;
  const defaultPeriod = tipo === 'semana' ? "Próxima Semana" : "Próximo Feirão";
  
  const data = loadData<{ vagas: VagaLocal[], periodo: string } | VagaLocal[]>(key, { vagas: [], periodo: defaultPeriod });
  
  if (Array.isArray(data)) {
    return { vagas: data, periodo: defaultPeriod };
  }
  
  return { 
    vagas: data.vagas || [], 
    periodo: data.periodo || defaultPeriod
  };
};

export const performMonthlyBackup = (year: number | string, month: string) => {
  const backupKey = generateStorageKey(APP_PREFIX, 'backup', year, month);
  
  const week1 = loadData(generateStorageKey(APP_PREFIX, 'vagas', year, month, 'semana', 1), { vagas: [], periodo: "" });
  const week2 = loadData(generateStorageKey(APP_PREFIX, 'vagas', year, month, 'semana', 2), { vagas: [], periodo: "" });
  const week3 = loadData(generateStorageKey(APP_PREFIX, 'vagas', year, month, 'semana', 3), { vagas: [], periodo: "" });
  const week4 = loadData(generateStorageKey(APP_PREFIX, 'vagas', year, month, 'semana', 4), { vagas: [], periodo: "" });
  const feirao = loadData(generateStorageKey(APP_PREFIX, 'feirao', year, month), { vagas: [], periodo: "" });
  
  const backupData: HistoricoMensal = {
    year,
    month,
    weeks: {
      semana_1: week1 as any,
      semana_2: week2 as any,
      semana_3: week3 as any,
      semana_4: week4 as any,
    },
    feirao: feirao as any,
    consolidatedAt: new Date().toISOString()
  };
  
  saveData(backupKey, backupData);
};

export const getHistory = (): HistoricoMensal[] => {
  const history: HistoricoMensal[] = [];
  const prefix = `${APP_PREFIX}_backup_`;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      const data = loadData<HistoricoMensal | null>(key, null);
      if (data) history.push(data);
    }
  }
  
  return history.sort((a, b) => {
    const dateA = `${a.year}_${a.month}`;
    const dateB = `${b.year}_${b.month}`;
    return dateB.localeCompare(dateA);
  });
};

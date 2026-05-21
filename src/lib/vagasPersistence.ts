
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
    vagasKey: `sine_vagas_${year}_${month}_semana_${week}`,
    feiraoKey: `sine_feirao_${year}_${month}`,
    backupKey: `sine_backup_${year}_${month}`,
    monthYear: `${year}_${month}`
  };
};

export const saveVagasToLocalStorage = (tipo: 'semana' | 'feirao', vagas: VagaLocal[], periodo: string) => {
  const info = getWeekInfo();
  const key = tipo === 'semana' ? info.vagasKey : info.feiraoKey;
  const dataToSave = {
    vagas,
    periodo
  };
  localStorage.setItem(key, JSON.stringify(dataToSave));
  
  // If it's week 4 and we are saving semana, also trigger/update backup
  if (info.week === 4) {
    performMonthlyBackup(info.year, info.month);
  }
};

export const loadVagasFromLocalStorage = (tipo: 'semana' | 'feirao'): { vagas: VagaLocal[], periodo: string } => {
  const info = getWeekInfo();
  const key = tipo === 'semana' ? info.vagasKey : info.feiraoKey;
  const saved = localStorage.getItem(key);
  if (saved) {
    const parsed = JSON.parse(saved);
    // Support old format or just array
    if (Array.isArray(parsed)) {
      return { vagas: parsed, periodo: tipo === 'semana' ? "Próxima Semana" : "Próximo Feirão" };
    }
    return { 
      vagas: parsed.vagas || [], 
      periodo: parsed.periodo || (tipo === 'semana' ? "Próxima Semana" : "Próximo Feirão")
    };
  }
  return { vagas: [], periodo: tipo === 'semana' ? "Próxima Semana" : "Próximo Feirão" };
};

export const performMonthlyBackup = (year: number | string, month: string) => {
  const backupKey = `sine_backup_${year}_${month}`;
  
  const week1 = JSON.parse(localStorage.getItem(`sine_vagas_${year}_${month}_semana_1`) || '[]');
  const week2 = JSON.parse(localStorage.getItem(`sine_vagas_${year}_${month}_semana_2`) || '[]');
  const week3 = JSON.parse(localStorage.getItem(`sine_vagas_${year}_${month}_semana_3`) || '[]');
  const week4 = JSON.parse(localStorage.getItem(`sine_vagas_${year}_${month}_semana_4`) || '[]');
  const feirao = JSON.parse(localStorage.getItem(`sine_feirao_${year}_${month}`) || '[]');
  
  const backupData = {
    year,
    month,
    weeks: {
      semana_1: week1,
      semana_2: week2,
      semana_3: week3,
      semana_4: week4,
    },
    feirao,
    consolidatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(backupKey, JSON.stringify(backupData));
};

export const getHistory = () => {
  const history: any[] = [];
  // Scan localStorage for backup keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('sine_backup_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        history.push(data);
      } catch (e) {
        console.error("Error parsing backup data", e);
      }
    }
  }
  return history.sort((a, b) => {
    const dateA = `${a.year}_${a.month}`;
    const dateB = `${b.year}_${b.month}`;
    return dateB.localeCompare(dateA);
  });
};

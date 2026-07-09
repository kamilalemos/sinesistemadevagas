import { VagaLocal, HistoricoMensal } from '@/types';
import { generateStorageKey, saveData, loadData } from '@/services/storage';

const APP_PREFIX = 'sine';

export interface WeekRef {
  year: number;
  month: string; // "MM"
  week: number;  // 1..4
}

export const getWeekInfo = (ref?: Partial<WeekRef>) => {
  const now = new Date();
  const year = ref?.year ?? now.getFullYear();
  const month = ref?.month ?? String(now.getMonth() + 1).padStart(2, '0');
  const day = now.getDate();

  let week: number;
  if (ref?.week) {
    week = ref.week;
  } else {
    week = 1;
    if (day >= 8 && day <= 14) week = 2;
    else if (day >= 15 && day <= 21) week = 3;
    else if (day >= 22) week = 4;
  }

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

/** Deriva ano/mes/semana a partir de um ISO date (createdAt da vaga). */
export const weekRefFromIso = (iso?: string): WeekRef | undefined => {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  const day = d.getDate();
  let week = 1;
  if (day >= 8 && day <= 14) week = 2;
  else if (day >= 15 && day <= 21) week = 3;
  else if (day >= 22) week = 4;
  return {
    year: d.getFullYear(),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    week,
  };
};

export interface PeriodoDatas {
  data_inicio?: string | null; // 'yyyy-mm-dd'
  data_fim?: string | null;
  nome?: string | null; // rótulo opcional do admin
}

export const saveVagasToLocalStorage = (
  tipo: 'semana' | 'feirao',
  vagas: VagaLocal[],
  periodo: string,
  weekRefOverride?: WeekRef,
  datas?: PeriodoDatas,
) => {
  const info = getWeekInfo(weekRefOverride);
  const key = tipo === 'semana' ? info.vagasKey : info.feiraoKey;
  const dataToSave = {
    vagas,
    periodo,
    data_inicio: datas?.data_inicio ?? null,
    data_fim: datas?.data_fim ?? null,
    nome: datas?.nome ?? null,
  };

  saveData(key, dataToSave);

  // Sempre atualiza o backup mensal ao salvar qualquer vaga
  performMonthlyBackup(info.year, info.month);
};

export const loadVagasFromLocalStorage = (
  tipo: 'semana' | 'feirao',
): { vagas: VagaLocal[]; periodo: string; data_inicio: string | null; data_fim: string | null; nome: string | null } => {
  const info = getWeekInfo();
  const key = tipo === 'semana' ? info.vagasKey : info.feiraoKey;
  const defaultPeriod = tipo === 'semana' ? "Próxima Semana" : "Próximo Feirão";

  const data = loadData<any>(key, { vagas: [], periodo: defaultPeriod });

  if (Array.isArray(data)) {
    return { vagas: data, periodo: defaultPeriod, data_inicio: null, data_fim: null, nome: null };
  }

  return {
    vagas: data.vagas || [],
    periodo: data.periodo || defaultPeriod,
    data_inicio: data.data_inicio ?? null,
    data_fim: data.data_fim ?? null,
    nome: data.nome ?? null,
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

/**
 * Remove chaves de vagas semanais antigas do localStorage (mantém últimas N semanas).
 * Nunca remove chaves de backup mensal (sine_backup_*) nem feirão.
 */
export function cleanupOldStorageKeys(maxSemanas = 12): void {
  const agora = new Date();
  const cutoff = new Date(agora);
  cutoff.setDate(cutoff.getDate() - maxSemanas * 7);

  const keysParaRemover: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith('sine_vagas_') || key.includes('backup')) continue;

    const match = key.match(/sine_vagas_(\d{4})_(\d{2})/);
    if (!match) continue;

    const dataChave = new Date(Number(match[1]), Number(match[2]) - 1);
    if (dataChave < cutoff) {
      keysParaRemover.push(key);
    }
  }

  keysParaRemover.forEach((k) => localStorage.removeItem(k));

  if (keysParaRemover.length > 0 && import.meta.env.DEV) {
    console.log(`[storage cleanup] ${keysParaRemover.length} chave(s) antiga(s) removida(s).`);
  }
}

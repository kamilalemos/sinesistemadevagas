import { useEffect, useSyncExternalStore } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVagasLocalStore } from '../store/vagasStorage';
import { VagaLocal } from '../types';
import { STORAGE_KEYS } from '../constants/storageKeys';

type Tipo = 'semana' | 'feirao';

// Camada de serviço — lê do store de forma async. Permite trocar por API no futuro.
const vagasService = {
  getAll: async (): Promise<VagaLocal[]> => {
    const s = useVagasLocalStore.getState();
    return [...s.vagas_semana, ...s.vagas_feirao];
  },
  getSemana: async (): Promise<VagaLocal[]> =>
    useVagasLocalStore.getState().vagas_semana.filter(v => v.publicada),
  getFeirao: async (): Promise<VagaLocal[]> =>
    useVagasLocalStore.getState().vagas_feirao.filter(v => v.publicada),

  create: async (tipo: Tipo, vaga: Omit<VagaLocal, 'id' | 'createdAt'>) => {
    useVagasLocalStore.getState().addVaga(tipo, vaga);
    autoBackup();
  },
  update: async (tipo: Tipo, id: string, patch: Partial<VagaLocal>) => {
    useVagasLocalStore.getState().updateVaga(tipo, id, patch);
    autoBackup();
  },
  remove: async (tipo: Tipo, id: string) => {
    useVagasLocalStore.getState().deleteVaga(tipo, id);
    autoBackup();
  },
};

// Backup silencioso em JSON após cada mutação
function autoBackup() {
  try {
    const s = useVagasLocalStore.getState();
    const payload = JSON.stringify({
      vagas_semana: s.vagas_semana,
      vagas_feirao: s.vagas_feirao,
      periodo_semana: s.periodo_semana,
      periodo_feirao: s.periodo_feirao,
      exportadoEm: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.VAGAS_BACKUP, payload);
    localStorage.setItem(STORAGE_KEYS.VAGAS_BACKUP_DATE, new Date().toISOString());
  } catch (e) {
    console.warn('[sine] Falha ao salvar backup automático:', e);
  }
}

// Mantém o React Query sincronizado com mudanças do Zustand
function useStoreSync() {
  const qc = useQueryClient();
  useEffect(() => {
    const unsub = useVagasLocalStore.subscribe(() => {
      qc.invalidateQueries({ queryKey: ['vagas'] });
    });
    return unsub;
  }, [qc]);
}

// ─── Hooks para páginas públicas ───────────────────────────────────────────

export function useVagasDaSemana() {
  useStoreSync();
  const periodo = useVagasLocalStore(s => s.periodo_semana);
  const query = useQuery({
    queryKey: ['vagas', 'semana'],
    queryFn: vagasService.getSemana,
    staleTime: 1000 * 60 * 5,
  });
  return { ...query, periodo };
}

export function useVagasFeirao() {
  useStoreSync();
  const periodo = useVagasLocalStore(s => s.periodo_feirao);
  const ativo = useVagasLocalStore(s => s.feirao_ativa);
  const query = useQuery({
    queryKey: ['vagas', 'feirao'],
    queryFn: vagasService.getFeirao,
    staleTime: 1000 * 60 * 5,
  });
  return { ...query, periodo, ativo };
}

// ─── Hooks para área admin ─────────────────────────────────────────────────

export function useTodasVagas() {
  useStoreSync();
  return useQuery({
    queryKey: ['vagas', 'todas'],
    queryFn: vagasService.getAll,
    staleTime: 0,
  });
}

export function useVagasMutations() {
  const queryClient = useQueryClient();
  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['vagas'] });

  const criar = useMutation({
    mutationFn: ({ tipo, vaga }: { tipo: Tipo; vaga: Omit<VagaLocal, 'id' | 'createdAt'> }) =>
      vagasService.create(tipo, vaga),
    onSuccess: invalidar,
  });
  const editar = useMutation({
    mutationFn: ({ tipo, id, patch }: { tipo: Tipo; id: string; patch: Partial<VagaLocal> }) =>
      vagasService.update(tipo, id, patch),
    onSuccess: invalidar,
  });
  const remover = useMutation({
    mutationFn: ({ tipo, id }: { tipo: Tipo; id: string }) => vagasService.remove(tipo, id),
    onSuccess: invalidar,
  });

  return { criar, editar, remover };
}

// Hook utilitário para data do último backup (usado no Dashboard)
export function useUltimoBackup(): string | null {
  return localStorage.getItem(STORAGE_KEYS.VAGAS_BACKUP_DATE);
}

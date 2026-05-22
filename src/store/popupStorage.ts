import { create } from 'zustand';
import { PopupConfig } from '@/types';
import { saveData, loadData } from '@/services/storage';

interface PopupState {
  config: PopupConfig;
  setAtivo: (ativo: boolean) => void;
  updateConfig: (config: Partial<PopupConfig>) => void;
}

const STORAGE_KEY = 'popup_informativo';

const DEFAULT_CONFIG: PopupConfig = {
  ativo: false,
  titulo: "Aviso Importante",
  descricao: "Confira as últimas novidades e oportunidades do portal.",
  imagemBase64: "",
  botaoTexto: "Entendi",
  botaoLink: "",
};

const getInitialState = (): PopupConfig => {
  const saved = loadData<PopupConfig | null>(STORAGE_KEY, null);
  if (!saved) return DEFAULT_CONFIG;

  // Migração de campo antigo 'imagem' para 'imagemBase64' se necessário
  const config = { ...saved } as any;
  if (config.imagem && !config.imagemBase64) {
    config.imagemBase64 = config.imagem;
    delete config.imagem;
  }
  return config as PopupConfig;
};

export const usePopupStore = create<PopupState>((set) => ({
  config: getInitialState(),
  setAtivo: (ativo) => set((state) => {
    const newConfig = { ...state.config, ativo };
    saveData(STORAGE_KEY, newConfig);
    return { config: newConfig };
  }),
  updateConfig: (newConfig) => set((state) => {
    const updated = { ...state.config, ...newConfig };
    saveData(STORAGE_KEY, updated);
    return { config: updated };
  }),
}));

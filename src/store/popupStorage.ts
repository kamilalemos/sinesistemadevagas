import { create } from 'zustand';

export interface PopupConfig {
  ativo: boolean;
  titulo: string;
  descricao: string;
  imagem: string;
  botaoTexto: string;
  botaoLink: string;
}

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
  imagem: "",
  botaoTexto: "Entendi",
  botaoLink: "",
};

const getInitialState = (): PopupConfig => {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing popup config", e);
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
};

export const usePopupStore = create<PopupState>((set) => ({
  config: getInitialState(),
  setAtivo: (ativo) => set((state) => {
    const newConfig = { ...state.config, ativo };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    return { config: newConfig };
  }),
  updateConfig: (newConfig) => set((state) => {
    const updated = { ...state.config, ...newConfig };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { config: updated };
  }),
}));

import { create } from 'zustand';

export interface BannerConfig {
  ativo: boolean;
  titulo: string;
  descricao: string;
  imagemBase64: string;
  textoBotao: string;
  linkBotao: string;
}

interface BannerState {
  config: BannerConfig;
  setAtivo: (ativo: boolean) => void;
  updateConfig: (config: Partial<BannerConfig>) => void;
}

const STORAGE_KEY = 'banner_principal';

const DEFAULT_CONFIG: BannerConfig = {
  ativo: true,
  titulo: "Painel da Empregabilidade",
  descricao: "de João Pessoa",
  imagemBase64: "",
  textoBotao: "Ver Vagas",
  linkBotao: "/vagas",
};

const getInitialState = (): BannerConfig => {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing banner config", e);
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
};

export const useBannerStore = create<BannerState>((set) => ({
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

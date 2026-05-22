import { create } from 'zustand';
import { BannerConfig } from '@/types';
import { saveData, loadData } from '@/services/storage';

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

export const useBannerStore = create<BannerState>((set) => ({
  config: loadData<BannerConfig>(STORAGE_KEY, DEFAULT_CONFIG),
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

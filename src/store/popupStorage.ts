import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

const DEFAULT_CONFIG: PopupConfig = {
  ativo: false,
  titulo: "Aviso Importante",
  descricao: "Confira as últimas novidades e oportunidades do portal.",
  imagem: "",
  botaoTexto: "Entendi",
  botaoLink: "",
};

export const usePopupStore = create<PopupState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      setAtivo: (ativo) => set((state) => ({ config: { ...state.config, ativo } })),
      updateConfig: (newConfig) => set((state) => ({ config: { ...state.config, ...newConfig } })),
    }),
    {
      name: 'popup_informativo', // Key specified by the user
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Existing legacy types (mantidos para compatibilidade — não substituir nesta etapa)
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

export interface BannerConfig {
  ativo: boolean;
  titulo: string;
  descricao: string;
  imagemBase64: string;
  textoBotao: string;
  linkBotao: string;
}

export interface PopupConfig {
  ativo: boolean;
  titulo: string;
  descricao: string;
  imagemBase64: string;
  botaoTexto: string;
  botaoLink: string;
}

export interface HistoricoMensal {
  year: number | string;
  month: string;
  weeks: {
    semana_1: { vagas: VagaLocal[]; periodo: string };
    semana_2: { vagas: VagaLocal[]; periodo: string };
    semana_3: { vagas: VagaLocal[]; periodo: string };
    semana_4: { vagas: VagaLocal[]; periodo: string };
  };
  feirao: { vagas: VagaLocal[]; periodo: string };
  consolidatedAt: string;
}

// Novos schemas/tipos Zod (Prompt 1) — expostos com nomes próprios para evitar conflito
export { VagaSchema, VagasArraySchema, type Vaga } from './vaga';
export { BannerConfigSchema, type BannerConfig as BannerConfigZ } from './banner';
export { AdminSessionSchema, type AdminSession } from './admin';

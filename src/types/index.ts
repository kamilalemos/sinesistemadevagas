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

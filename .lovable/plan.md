# Plano de migração para armazenamento local (LocalStorage)

## Visão Geral
Substituir a dependência do Supabase para gestão de vagas por um sistema baseado inteiramente em `localStorage`, mantendo a interface administrativa e pública atual.

## Passo 1: Nova infraestrutura de dados (Store)
- Criar `src/store/vagasStorage.ts` usando Zustand com persistência `localStorage` para gerenciar dois estados separados: `vagasSemana` e `vagasFeirao`.

## Passo 2: Criar novo componente de cadastro manual
- Substituir o componente `SectionCadastroManual` (ou criar `SectionCadastroManualLocal`) para manipular os dados na nova store local em vez de realizar chamadas à API do Supabase.

## Passo 3: Ajustar página Admin
- Remover componentes de upload (`SectionUpload`), parser, e outros resquícios de infraestrutura antiga.
- Criar a aba "Cadastro de Vagas" com sub-abas para "Vagas da Semana" e "Feirão".
- Integrar com o formulário de cadastro manual local.

## Passo 4: Ajustar áreas públicas (Vagas.tsx e Feirao.tsx)
- Modificar estes componentes para consumir os dados diretamente da nova store `vagasStorage.ts` em vez dos hooks `useVagas`.
- Ocultar campo de empresa e filtrar apenas vagas publicadas.

## Passo 5: Limpeza Final
- Remover hooks `useVagas.tsx` e qualquer arquivo ou função não mais utilizada referente à importação ou persistência via Supabase.

## Detalhes técnicos
- Estrutura de dados:
  `{ id: string, qtd: number, cbo: string, descricao: string, escolaridade: string, experiencia: string, codigo: string, beneficios: string, salario: string, empresa: string, publicada: boolean, createdAt: string }`
- Chaves localStorage: `vagas_semana`, `vagas_feirao`.

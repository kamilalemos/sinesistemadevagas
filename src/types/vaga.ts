import { z } from 'zod';

// Schema reflete os campos reais do projeto (ver src/store/vagasStorage.ts -> VagaLocal)
export const VagaSchema = z.object({
  id: z.string(),
  quantidade: z.number().int().nonnegative(),
  cbo: z.string(),
  descricao: z.string().min(1),
  escolaridade: z.string(),
  experiencia: z.string(),
  codigo: z.string(),
  beneficios: z.string(),
  salario: z.string(),
  empresa: z.string(),
  publicada: z.boolean().default(true),
  categoria: z.string(),
  periodo: z.string(),
  createdAt: z.string(),
});

export type Vaga = z.infer<typeof VagaSchema>;
export const VagasArraySchema = z.array(VagaSchema);

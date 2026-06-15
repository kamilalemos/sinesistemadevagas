import { z } from 'zod';

export const BannerConfigSchema = z.object({
  ativo: z.boolean(),
  titulo: z.string(),
  mensagem: z.string(),
  link: z.string().url().optional(),
});

export type BannerConfig = z.infer<typeof BannerConfigSchema>;

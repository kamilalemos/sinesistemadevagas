import { z } from 'zod';

export const AdminSessionSchema = z.object({
  token: z.string(),
  expiresAt: z.number(),
});

export type AdminSession = z.infer<typeof AdminSessionSchema>;

import { z } from 'zod';

export const idSchema = z.object({
  id: z.number().int().positive(),
});

export const nomeSchema = z.object({
  nome: z.string()
  .min(2, "O nome deve ter pelo menos 2 caracteres")
  .max(100, "O nome pode ter no máximo 100 caracteres")
  .regex(/^[A-Za-zÀ-ÿ\s]+$/, "O nome deve conter apenas letras e espaços")
  .trim()
});

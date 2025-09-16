import { z } from 'zod';

export const aprovadasSchema = z.object({
  idAluno: z.number().int().positive(),
  idsDisciplinas: z.array(z.number().int().positive()),
  aprovado: z.boolean()
});
  
export const periodoPlanSchema = z.object({
  idAluno: z.number().int().positive(),
  idsDisciplinas: z.array(z.number().int().positive()),
  periodoPlan: z.number().int().min(1)
});
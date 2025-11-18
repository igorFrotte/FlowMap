import { z } from 'zod';

export const aprovadasSchema = z.object({
  idsDisciplinas: z.array(z.number().int().positive()),
  aprovado: z.boolean()
});
  
export const periodoPlanSchema = z.object({
  idsDisciplinas: z.array(z.number().int().positive()),
  periodoPlan: z.number().int().min(1).nullable()
});

export const periodoPlanArraySchema = z.array(periodoPlanSchema);

const refString = z.string().regex(/^\d+-\d+(\.\d+)?$/, {
  message: 'Formato inválido. Deve ser "<numeroPeriodo>-<idTempDisciplina>", ex: "1-50".',
});

export const disciplinaSchema = z.object({
  id: z.number().positive(), 
  nome: z.string().min(1),
  periodo: z.number().int().positive(),
  credito: z.number().int().nonnegative(),
  dificuldade: z.number().int().min(0).max(10).nullable().optional(), 
  informacao: z.string().optional().nullable(),
  reqCreditos: z.number().int().nonnegative().nullable().optional(),
  reqPeriodos: z.number().int().nonnegative().nullable().optional(),
  preRequisitos: z.array(refString).optional().default([]),
  coRequisitos: z.array(refString).optional().default([]),
});

export const periodoSchema = z.object({
  numero: z.number().int().positive(),
  disciplinas: z.array(disciplinaSchema).optional().default([]),
});

export const criarCursoBodySchema = z
  .object({
    id: z.number().int().positive().optional(), 
    nome: z.string().min(1),
    idUniversidade: z.number().int().positive(),
    periodos: z.array(periodoSchema).min(1),
    nPeriodos: z.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    // nPeriodos deve bater com o array de periodos
    if (data.nPeriodos !== data.periodos.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "nPeriodos deve ser igual ao length do array periodos.",
        path: ["nPeriodos"],
      });
    }

    // cada disciplina.periodo deve bater com periodo.numero
    data.periodos.forEach((p, idxPeriodo) => {
      p.disciplinas.forEach((disc, idxDisc) => {
        if (disc.periodo !== p.numero) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `disciplina.periodo (${disc.periodo}) deve ser igual ao numero do periodo (${p.numero}).`,
            path: ["periodos", idxPeriodo, "disciplinas", idxDisc, "periodo"],
          });
        }
      });
    });

    // verificar referências pre/co não apontarem para si mesmas
    data.periodos.forEach((p) => {
      p.disciplinas.forEach((disc) => {
        const selfRef = `${p.numero}-${disc.id}`;
        // preRequisitos
        (disc.preRequisitos ?? []).forEach((ref, i) => {
          if (ref === selfRef) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Disciplina não pode referenciar-se nos preRequisitos.",
              path: ["periodos", p.numero - 1, "disciplinas", disc.id, "preRequisitos", i],
            });
          }
        });
        // coRequisitos
        (disc.coRequisitos ?? []).forEach((ref, i) => {
          if (ref === selfRef) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Disciplina não pode referenciar-se nos coRequisitos.",
              path: ["periodos", p.numero - 1, "disciplinas", disc.id, "coRequisitos", i],
            });
          }
        });
      });
    });
  }); 

export type CriarCursoBody = z.infer<typeof criarCursoBodySchema>;

import type { Request, Response } from 'express';
import { disciplinasComDepsDoAluno } from '../services/disciplinaService.js';
import { idSchema } from '../schemas/idSchema.js';
import { STATUS_CODE } from '../enums/statusCode.js';

export async function disciplinasDoAluno(req: Request, res: Response) {
  const validacao = idSchema.safeParse({ id: Number(req.params.alunoId) });

  if (!validacao.success) {
    return res.status(STATUS_CODE.BAD_REQUEST).json({ error: "ID do aluno inválido" });
  }

  try {
    const resultado = await disciplinasComDepsDoAluno(validacao.data.id);
    return res.status(STATUS_CODE.OK).json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODE.SERVER_ERROR).json({ error: 'Erro ao buscar disciplinas' });
  }
};

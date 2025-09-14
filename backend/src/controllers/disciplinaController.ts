import type { Request, Response } from 'express';
import { disciplinasComDepsDoAluno } from '../services/disciplinaService.js';
import { idSchema } from '../schemas/idSchema.js';

export async function disciplinasDoAluno(req: Request, res: Response) {
  const validacao = idSchema.safeParse({ id: Number(req.params.alunoId) });

  if (!validacao.success) {
    return res.status(400).json({ error: "ID do aluno inválido" });
  }

  try {
    const resultado = await disciplinasComDepsDoAluno(validacao.data.id);
    return res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar disciplinas' });
  }
};

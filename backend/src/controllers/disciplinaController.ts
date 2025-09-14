import type { Request, Response } from 'express';
import { getDisciplinasComDeps } from '../services/disciplinaService.js';

export async function disciplinasDoAluno(req: Request, res: Response) {
  try {
    const resultado = await getDisciplinasComDeps()
    return res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar disciplinas' });
  }
};

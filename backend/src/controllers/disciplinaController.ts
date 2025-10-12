import type { Request, Response } from 'express';
import disciplinaService from '../services/disciplinaService.js';
import { STATUS_CODE } from '../enums/statusCode.js';
import { aprovadasSchema, periodoPlanArraySchema } from '../schemas/disciplinaSchema.js';

const disciplinaController = {

  disciplinasDoAluno: async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    if (!userId)
      return res.status(STATUS_CODE.UNAUTHORIZED).json({ error: "Usuário não autenticado" });
    try {
      const resultado = await disciplinaService.disciplinasComDepsDoAluno(userId);
      return res.status(STATUS_CODE.OK).json(resultado);
    } catch (error) {
      console.error(error);
      return res.status(STATUS_CODE.SERVER_ERROR).json({ error: 'Erro ao buscar disciplinas' });
    }
  },

  updateAprovadas: async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    if (!userId)
      return res.status(STATUS_CODE.UNAUTHORIZED).json({ error: "Aluno não autenticado" });
    const validacao = aprovadasSchema.safeParse(req.body);
    if (!validacao.success)
      return res.status(STATUS_CODE.BAD_REQUEST).json({ error: "Dados inválidos" });
    try {
      const { idsDisciplinas, aprovado } = validacao.data;
      const result = await disciplinaService.updateAprovadasDoAluno(userId, idsDisciplinas, aprovado);
      return res.status(STATUS_CODE.OK).json(result);
    } catch (error) {
      console.error(error);
      return res.status(STATUS_CODE.SERVER_ERROR).json({ message: 'Erro ao atualizar disciplinas aprovadas' });
    }
  },

  updatePeriodoPlan: async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    if (!userId)
      return res.status(STATUS_CODE.UNAUTHORIZED).json({ error: "Aluno não autenticado" });
    const validacao = periodoPlanArraySchema.safeParse(req.body);
    if (!validacao.success)
      return res.status(STATUS_CODE.BAD_REQUEST).json({ error: "Dados inválidos" });
    try {
      const periodos = validacao.data;
      const result = await disciplinaService.updatePeriodoPlanDoAluno(periodos, userId);
      return res.status(STATUS_CODE.OK).json(result);
    } catch (error) {
      console.error(error);
      return res.status(STATUS_CODE.SERVER_ERROR).json({ message: 'Erro ao atualizar período planejado das disciplinas' });
    }
  },

};

export default disciplinaController;
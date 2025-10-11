import type { Request, Response } from 'express';
import disciplinaService from '../services/disciplinaService.js';
import { idSchema } from '../schemas/idSchema.js';
import { STATUS_CODE } from '../enums/statusCode.js';
import { aprovadasSchema, periodoPlanArraySchema } from '../schemas/disciplinaSchema.js';

const disciplinaController = {

  disciplinasDoAluno: async (req: Request, res: Response) => {
    const validacao = idSchema.safeParse({ id: Number(req.params.alunoId) });
    if (!validacao.success)
      return res.status(STATUS_CODE.BAD_REQUEST).json({ error: "ID do aluno inválido" });
    try {
      const resultado = await disciplinaService.disciplinasComDepsDoAluno(validacao.data.id);
      return res.status(STATUS_CODE.OK).json(resultado);
    } catch (error) {
      console.error(error);
      return res.status(STATUS_CODE.SERVER_ERROR).json({ error: 'Erro ao buscar disciplinas' });
    }
  },

  updateAprovadas: async (req: Request, res: Response) => {
    const validacao = aprovadasSchema.safeParse(req.body);
    if (!validacao.success)
      return res.status(STATUS_CODE.BAD_REQUEST).json({ error: "Dados inválidos" });
    try {
      const { idAluno, idsDisciplinas, aprovado } = validacao.data;
      const result = await disciplinaService.updateAprovadasDoAluno(idAluno, idsDisciplinas, aprovado);
      return res.status(STATUS_CODE.OK).json(result);
    } catch (error) {
      console.error(error);
      return res.status(STATUS_CODE.SERVER_ERROR).json({ message: 'Erro ao atualizar disciplinas aprovadas' });
    }
  },

  updatePeriodoPlan: async (req: Request, res: Response) => {
    const validacao = periodoPlanArraySchema.safeParse(req.body);
    if (!validacao.success)
      return res.status(STATUS_CODE.BAD_REQUEST).json({ error: "Dados inválidos" });
    try {
      const periodos = validacao.data;
      const result = await disciplinaService.updatePeriodoPlanDoAluno(periodos);
      return res.status(STATUS_CODE.OK).json(result);
    } catch (error) {
      console.error(error);
      return res.status(STATUS_CODE.SERVER_ERROR).json({ message: 'Erro ao atualizar período planejado das disciplinas' });
    }
  },

};

export default disciplinaController;
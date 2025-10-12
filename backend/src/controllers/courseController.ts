import type { Request, Response } from "express";
import courseService from "../services/courseService.js";
import { idSchema } from "../schemas/idSchema.js";
import { STATUS_CODE } from "../enums/statusCode.js";

const courseController = {
  listarUniversidades: async (_req: Request, res: Response) => {
    try {
      const universidades = await courseService.listarUniversidades();
      return res.status(STATUS_CODE.OK).json(universidades);
    } catch (error) {
      console.error(error);
      return res
        .status(STATUS_CODE.SERVER_ERROR)
        .json({ error: "Erro ao listar universidades" });
    }
  },

  cursosDaUniversidade: async (req: Request, res: Response) => {
    const validacao = idSchema.safeParse({ id: Number(req.params.idUniversidade) });
    if (!validacao.success)
      return res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: "ID da universidade inválido" });

    try {
      const cursos = await courseService.cursosDaUniversidade(validacao.data.id);
      return res.status(STATUS_CODE.OK).json(cursos);
    } catch (error) {
      console.error(error);
      return res
        .status(STATUS_CODE.SERVER_ERROR)
        .json({ error: "Erro ao listar cursos da universidade" });
    }
  },
};

export default courseController;

import type { Request, Response } from "express";
import courseService from "../services/courseService.js";
import { idSchema, nomeSchema } from "../schemas/basicSchema.js";
import { STATUS_CODE } from "../enums/statusCode.js";
import { DuplicatedItemError, NotFoundError } from "../exceptions/erros.js";
import { criarCursoBodySchema } from "../schemas/disciplinaSchema.js";

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
    try {
      const validacao = idSchema.safeParse({ id: Number(req.params.idUniversidade) });
      if (!validacao.success)
        return res
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ error: JSON.parse(validacao.error.message)[0].message }); 

      const cursos = await courseService.cursosDaUniversidade(validacao.data.id);
      return res.status(STATUS_CODE.OK).json(cursos);
    } catch (error) {
      console.error(error);
      return res
        .status(STATUS_CODE.SERVER_ERROR)
        .json({ error: "Erro ao listar cursos da universidade" });
    }
  },

  cursosDoADM: async (req: Request, res: Response) => {
    const idADM = res.locals.userId;
    try {
      const cursos = await courseService.cursosDoADM(idADM);
      return res.status(STATUS_CODE.OK).json(cursos);
    } catch (error) {
      console.error(error);
      return res
        .status(STATUS_CODE.SERVER_ERROR)
        .json({ error: "Erro ao listar cursos do ADM" });
    }
  },

  criarUniversidade: async (req: Request, res: Response) => {   
    try {
      const validacao = nomeSchema.safeParse(req.body);
      if (!validacao.success)
        return res
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ error: JSON.parse(validacao.error.message)[0].message }); 

      const universidade = await courseService.criarUniversidade(validacao.data.nome);
      return res.status(STATUS_CODE.CREATED).json(universidade);
    } catch (error) {
      console.error(error);
      if (error instanceof DuplicatedItemError)
        return res.status(STATUS_CODE.CONFLICT).json({ error: error.message });
      return res
        .status(STATUS_CODE.SERVER_ERROR)
        .json({ error: "Erro ao criar universidade." });
    }
  },

  buscarCursoPeloId: async (req: Request, res: Response) => {   
    try {
      const validacao = idSchema.safeParse({ id: Number(req.params.idCurso) });
      if (!validacao.success)
        return res
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ error: JSON.parse(validacao.error.message)[0].message }); 

      const curso = await courseService.cursoPeloId(validacao.data.id);
      return res.status(STATUS_CODE.CREATED).json(curso);
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundError)
        return res.status(STATUS_CODE.NOT_FOUND).json({ error: error.message });
      return res
        .status(STATUS_CODE.SERVER_ERROR)
        .json({ error: "Erro ao buscar curso." });
    }
  },



  criarCurso: async (req: Request, res: Response) => {
    const idadm = res.locals.userId;
    try {      
      const parsed = criarCursoBodySchema.safeParse(req.body);
      if (!parsed.success)
        return res
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ error: JSON.parse(parsed.error.message)[0].message }); 

      const payload = parsed.data as any;
      const curso = await courseService.criarCursoCompleto(idadm, payload);
      return res.status(STATUS_CODE.CREATED).json(curso);
    } catch (err) {
      console.error(err);
      return res.status(STATUS_CODE.SERVER_ERROR).json({ erro: "Erro ao criar curso" });
    }
  },

  atualizarCurso: async (req: Request, res: Response) => {
    const idadm = res.locals.userId;
    try {
      const validacao = idSchema.safeParse({ id: Number(req.params.idCurso) });
      if (!validacao.success)
        return res
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ error: JSON.parse(validacao.error.message)[0].message }); 
      
      const parsed = criarCursoBodySchema.safeParse(req.body);
      if (!parsed.success)
        return res
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ error: JSON.parse(parsed.error.message)[0].message }); 

      const payload = parsed.data as any;
      const resultado = await courseService.atualizarCursoCompleto(validacao.data.id, idadm, payload);
      return res.status(STATUS_CODE.OK).json(resultado);
    } catch (err: any) {
      console.error(err);
      if (err.name === "NotFoundError") {
        return res.status(STATUS_CODE.NOT_FOUND).json({ erro: err.message });
      }
      if (err.name === "ForbiddenError") {
        return res.status(STATUS_CODE.FORBIDDEN).json({ erro: err.message });
      }
      return res.status(STATUS_CODE.SERVER_ERROR).json({ erro: "Erro ao atualizar curso" });
    }
  },

  removerCurso: async (req: Request, res: Response) => {
    return res.sendStatus(STATUS_CODE.FORBIDDEN);
  },  


};

export default courseController;



import type { Request, Response } from 'express';
import { STATUS_CODE } from '../enums/statusCode.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { authSchema, signUpSchema } from '../schemas/authSchema.js';
import authService from '../services/authService.js';

dotenv.config();

const authController = {
  signIn: async (req: Request, res: Response) => {
    const validacao = authSchema.safeParse(req.body);
    if (!validacao.success)
      return res.status(STATUS_CODE.BAD_REQUEST).json({ error: "Dados inválidos" });
    try {
        const { email, password } = validacao.data;
        const result = await authService.verificarEmail(email);

        if (!result)
            return res.sendStatus(STATUS_CODE.UNAUTHORIZED);

        if (!bcrypt.compareSync(password, result?.senha))
            return res.sendStatus(STATUS_CODE.UNAUTHORIZED);

        const token = jwt.sign(
            { userId: result?.id },
            process.env.TOKEN_SECRET || "chaveSecreta",
            { expiresIn: 3600 * 2}
        );

        const response = {
            userId: result?.id,
            userName: result?.nome,
            userCourseId: result?.idcurso,
            token  
        };
        return res.status(STATUS_CODE.OK).json(response);
      } catch (error) {
        console.error(error);
        return res.status(STATUS_CODE.SERVER_ERROR).json({ message: 'Erro ao logar' });
    }
  },

  signUp: async (req: Request, res: Response) => {
    try {
      const { email, nome, idCurso, password } = req.body;
      const validacao = signUpSchema.safeParse(req.body);
      if (!validacao.success)
        return res.status(STATUS_CODE.BAD_REQUEST).json({ error: "Dados inválidos" });
        
      const alunoExistente = await authService.verificarEmail(email);
      if (alunoExistente)
        return res.status(STATUS_CODE.CONFLICT).json({ message: 'Email já cadastrado.' });
  
      const hashSenha = await bcrypt.hash(password, 10);
  
      const novoAluno = await authService.criarAluno(email, nome, idCurso, hashSenha);
  
      const { senha: _, ...alunoSemSenha } = novoAluno;
      console.log(alunoSemSenha)
  
      return res.status(STATUS_CODE.CREATED).json(alunoSemSenha);
    } catch (error) {
      console.error(error);
      return res.status(STATUS_CODE.SERVER_ERROR).json({ message: 'Erro ao cadastrar aluno.' });
    }
  },

  auth: (req: Request, res: Response) => {
      return res.sendStatus(STATUS_CODE.OK);
  },

};

export default authController;


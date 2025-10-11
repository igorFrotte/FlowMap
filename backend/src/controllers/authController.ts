import type { Request, Response } from 'express';
import { STATUS_CODE } from '../enums/statusCode.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { authSchema } from '../schemas/authSchema.js';
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

        if (!result){
            console.log("erro email")
            return res.sendStatus(STATUS_CODE.UNAUTHORIZED);
        }

        const senha = "Senha123!"; 
        const saltRounds = 10;

        const hash = bcrypt.hashSync(senha, saltRounds);
        console.log(hash);

        if (!bcrypt.compareSync(password, result?.senha)){
            console.log("erro senha")
            return res.sendStatus(STATUS_CODE.UNAUTHORIZED);
        }

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

  auth: (req: Request, res: Response) => {
      return res.sendStatus(STATUS_CODE.OK);
  },

};

export default authController;


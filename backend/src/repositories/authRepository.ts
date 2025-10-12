import prisma from '../prisma/client.js';
import { Prisma } from '../generated/prisma/index.js';

const authRepository = {
  
  listarEmailSenha: async (email : string) => {
    return prisma.aluno.findFirst({
      where: { email }
    });
  },

  criarAluno: async (email: string, nome: string, idCurso: number, senha: string, tx: Prisma.TransactionClient = prisma) => {
    return tx.aluno.create({
      data: { email, nome, idcurso: idCurso, senha },
    });
  },


};

export default authRepository;
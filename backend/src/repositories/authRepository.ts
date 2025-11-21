import prisma from '../prisma/client.js';
import type { TxClient } from '../types/prisma.js';

const authRepository = {

  listarAlunoPorEmail: async (email: string) => {
    return prisma.aluno.findFirst({
      where: { email }
    });
  },
  
  listarAdmPorEmail: async (email: string) => {
    return prisma.administrador.findFirst({
      where: { email }
    });
  },

  criarAluno: async (tx: TxClient = prisma, email: string, nome: string, idCurso: number, senha: string) => {
    return tx.aluno.create({
      data: { email, nome, idcurso: idCurso, senha },
    });
  },

  alunosDoCurso: async (tx: TxClient = prisma, idCurso: number) => {
    return tx.aluno.findMany({
      where: {idcurso: idCurso}
    });
  },

};

export default authRepository;
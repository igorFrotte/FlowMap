import prisma from '../prisma/client.js';

export const disciplinasRepository = {
  async findAllWithDeps(idAluno : number) {
    return prisma.aluno_disciplina.findMany({
      where: {
        idaluno: idAluno
      },
      include: {
        disciplina : {
          include: {
            requisitos: { include: { req: true } },
            dependentes: { include: { dep: true } }
          }
        }
      }
    });
  }
};

import prisma from '../prisma/client.js';
import { Prisma } from '../generated/prisma/index.js';

const disciplinaRepository = {
  
  disciplinasComDependenciasDoAluno: async (idAluno : number) => {
    return prisma.aluno_disciplina.findMany({
      where: { idaluno: idAluno },
      include: {
        disciplina : {
          include: {
            requisitos: { include: { req: true } },
            dependentes: { include: { dep: true } }
          }
        }
      }
    });
  },

  updateDisciplinasAprovadasDoAluno: async (idAluno: number, idsDisciplinas: number[], aprovado: boolean) => {
    return prisma.aluno_disciplina.updateMany({
      where: {
        idaluno: idAluno,
        iddisciplina: { in: idsDisciplinas }
      },
      data: { aprovado }
    })
  }, 

  updateDisciplinasPeriodoPlanDoAluno: async (periodos: {idsDisciplinas: number[], periodoPlan: number}[], idAluno: number) => {
    const updates = periodos.map(p =>
      prisma.aluno_disciplina.updateMany({
        where: {
          idaluno: idAluno,
          iddisciplina: { in: p.idsDisciplinas }
        },
        data: { periodoplan: p.periodoPlan }
      })
    );
  
    // Executa todos os updates em uma única transação
    return prisma.$transaction(updates);
  },

  disciplinasDoCurso: async (idCurso: number, tx: Prisma.TransactionClient = prisma) => {
    return tx.disciplina.findMany({ where: { idcurso: idCurso } });
  },

  inserirDisciplinasDoAluno: async (disciplinas: { idAluno: number; idDisciplina: number }[], tx: Prisma.TransactionClient = prisma) => {
    return tx.aluno_disciplina.createMany({
      data: disciplinas.map(d => ({
        idaluno: d.idAluno,
        iddisciplina: d.idDisciplina,
      })),
    });
  },

};

export default disciplinaRepository;
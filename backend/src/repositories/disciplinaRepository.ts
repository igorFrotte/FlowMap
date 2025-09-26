import prisma from '../prisma/client.js';

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

  updateDisciplinasPeriodoPlanDoAluno: async (periodos: {idAluno: number, idsDisciplinas: number[], periodoPlan: number}[]) => {
    const updates = periodos.map(p =>
      prisma.aluno_disciplina.updateMany({
        where: {
          idaluno: p.idAluno,
          iddisciplina: { in: p.idsDisciplinas }
        },
        data: { periodoplan: p.periodoPlan }
      })
    );
  
    // Executa todos os updates em uma única transação
    return prisma.$transaction(updates);
  }

};

export default disciplinaRepository;
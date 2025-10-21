import prisma from '../prisma/client.js';
import type { DisciplinaFormatoCriacao } from '../types/disciplina.js';
import type { TxClient } from '../types/prisma.js';

const disciplinaRepository = {
  
  disciplinasComDependenciasDoAluno: async (idAluno : number) => {
    return prisma.aluno_disciplina.findMany({
      where: { idaluno: idAluno },
      include: {
        disciplina : {
          include: {
            requisitos: { include: { req: true } },
            dependentes: { include: { dep: true } },
            correquisitos: { include: { correq: true }}
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

  disciplinasDoCurso: async (tx: TxClient = prisma, idCurso: number) => {
    return tx.disciplina.findMany({ where: { idcurso: idCurso } });
  },

  inserirDisciplinasDoAluno: async (tx: TxClient = prisma, disciplinas: { idAluno: number; idDisciplina: number }[]) => {
    return tx.aluno_disciplina.createMany({
      data: disciplinas.map(d => ({
        idaluno: d.idAluno,
        iddisciplina: d.idDisciplina,
      })),
    });
  },

  criarDisciplina: async (tx: TxClient = prisma, idCurso: number, d: DisciplinaFormatoCriacao) => {
    return tx.disciplina.create({
      data: {
        idcurso: idCurso,
        nome: d.nome,
        periodo: d.periodo,
        credito: d.credito ?? 0,
        dificuldade: d.dificuldade ?? null,
        informacao: d.informacao ?? null,
        reqcreditos: d.reqCreditos ?? null,
        reqperiodo: d.reqPeriodos ?? null,
      },
    });
  },

  criarDependencias: async (tx: TxClient = prisma, dependencias: { idDisciplinaDep: number; idTempDisciplinaReq: string }[], tempToRealId: Map<string, number>) => {
    if (!dependencias.length) return [];

    const data = dependencias.map((d) => ({
      iddisciplinadep: d.idDisciplinaDep,
      iddisciplinareq: tempToRealId.get(d.idTempDisciplinaReq) || 0,
    }));

    return tx.dependencia.createMany({
      data,
      skipDuplicates: true, 
    });
  },

  criarCorrequisitos: async (tx: TxClient = prisma, corrs: { idDisciplina: number; idTempDisciplinaCorreq: string }[], tempToRealId: Map<string, number>) => {
    if (!corrs.length) return [];

    const data = corrs.map((c) => ({ 
      iddisciplina: c.idDisciplina,
      iddisciplinacorreq: tempToRealId.get(c.idTempDisciplinaCorreq) || 0,
    }));

    return tx.correquisito.createMany({
      data,
      skipDuplicates: true,
    });
  },

  deletarDisciplinasPorCurso: async (tx: TxClient = prisma, idCurso: number) => {
    return prisma.disciplina.deleteMany({
      where: { idcurso: idCurso },
    });
  },

};

export default disciplinaRepository;
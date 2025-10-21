import prisma from '../prisma/client.js';
import { Prisma } from '../generated/prisma/index.js';
import type { DisciplinaFormatoCriacao } from '../types/disciplina.js';

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

  criarDisciplinasBulk: async (idCurso: number, disciplinas: Omit<DisciplinaFormatoCriacao, "idTemp">[]) => {
    return prisma.$transaction(
      disciplinas.map(d =>
        prisma.disciplina.create({
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
        })
      )
    );
  },

  criarDisciplina: async (idCurso: number, d: DisciplinaFormatoCriacao) => {
    return prisma.disciplina.create({
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

  criarDependencias: async (dependencias: { idDisciplinaDep: number; idTempDisciplinaReq: string }[], tempToRealId: Map<string, number>) => {
    if (!dependencias.length) return [];
    return prisma.$transaction(
      dependencias.map(d =>
        prisma.dependencia.create({
          data: {
            iddisciplinareq: tempToRealId.get(d.idTempDisciplinaReq) || 0,
            iddisciplinadep: d.idDisciplinaDep,
          },
        })
      )
    );
  },

  criarCorrequisitos: async (corrs: { idDisciplina: number; idTempDisciplinaCorreq: string }[], tempToRealId: Map<string, number>) => {
    if (!corrs.length) return [];
    return prisma.$transaction(
      corrs.map(c =>
        prisma.correquisito.create({
          data: {
            iddisciplina: c.idDisciplina,
            iddisciplinacorreq: tempToRealId.get(c.idTempDisciplinaCorreq) || 0,
          },
        })
      )
    );
  },

  deletarDisciplinasPorCurso: async (idCurso: number) => {
    return prisma.disciplina.deleteMany({
      where: { idcurso: idCurso },
    });
  },

};

export default disciplinaRepository;
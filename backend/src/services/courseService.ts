import { DuplicatedItemError, ForbiddenError, NotFoundError } from "../exceptions/erros.js";
import prisma from "../prisma/client.js";
import authRepository from "../repositories/authRepository.js";
import courseRepository from "../repositories/courseRepository.js";
import disciplinaRepository from "../repositories/disciplinaRepository.js";
import type { DisciplinaFormatoCriacao, PeriodoDTO } from "../types/disciplina.js";
import type { TxClient } from "../types/prisma.js";

const courseService = {
  listarUniversidades: async () => {
    return courseRepository.listarUniversidades();
  },

  cursosDaUniversidade: async (idUniversidade: number) => {
    return courseRepository.cursosDaUniversidade(idUniversidade);
  },

  cursosDoADM: async (idADM: number) => {
    return courseRepository.cursosDoADM(idADM);
  },

  criarUniversidade: async (nome: string) => {
    const existente = await courseRepository.buscarUniversidadePeloNome(nome);
    if (existente) throw new DuplicatedItemError("Universidade já existe");
    return courseRepository.criarUniversidade(nome);
  },

  cursoPeloId: async (idCurso: number) => {
    const curso = await courseRepository.buscarCursoPeloIdComDisciplinas(idCurso);
    if (!curso) throw new NotFoundError("Curso não Existe");

    const periodosObj = curso.disciplinas.reduce((acc, d) => {
      const periodoAtual = acc[d.periodo] || [];
      periodoAtual.push({
        id: d.id,
        nome: d.nome,
        periodo: d.periodo,
        credito: d.credito,
        dificuldade: d.dificuldade,
        informacao: d.informacao,
        reqCreditos: d.reqcreditos,
        reqPeriodos: d.reqperiodo,
        preRequisitos: d.requisitos.map(r => `${r.req.periodo}-${r.req.id}`),
        coRequisitos: d.correquisitos.map(c => `${c.correq.periodo}-${c.correq.id}`),
      });
      acc[d.periodo] = periodoAtual;
      return acc;
    }, {} as Record<number, any[]>);

    const periodos = Object.entries(periodosObj)
      .sort(([a], [b]) => +a - +b)
      .map(([numero, disciplinas]) => ({ numero: +numero, disciplinas }));

    const cursoFormatado = {
      id: curso.id,
      nome: curso.nome,
      idUniversidade: curso.iduniversidade,
      periodos,
    };
    return cursoFormatado;
  },

  criarCursoCompleto: async (idadm: number, objeto: { idUniversidade: number; nome: string; nPeriodos: number; periodos: PeriodoDTO[] }) => {

    return prisma.$transaction(async (tx) => {

      const { idUniversidade, nome, nPeriodos, periodos } = objeto;
      const cursoCriado = await courseRepository.criarCurso(tx, idadm, idUniversidade, nome, nPeriodos);
      const idCurso = cursoCriado.id;
      
      await vincularDisciplinasAoCurso(tx, idCurso, periodos);

      return cursoCriado;
    });
  },

  atualizarCursoCompleto: async (idCurso: number, idadm: number, payload: { idUniversidade: number; nome: string; nPeriodos: number; periodos: PeriodoDTO[] }) => {
    const curso = await courseRepository.buscarCursoPeloIdComDisciplinas(idCurso);
    if (!curso) throw new NotFoundError("Curso não existe");
    if (curso.idadm !== idadm) throw new ForbiddenError("Curso não pertence ao ADM");

    return prisma.$transaction(async (tx) => {

      const idsAlunosDoCurso = (await authRepository.alunosDoCurso(tx, idCurso)).map( e => e.id);

      await courseRepository.atualizarCurso(tx, idCurso, { nome: payload.nome, iduniversidade: payload.idUniversidade, nperiodos: payload.nPeriodos });

      await disciplinaRepository.deletarDisciplinasPorCurso(tx, idCurso);

      const periodos = payload.periodos;

      const idsNovos = await vincularDisciplinasAoCurso(tx, idCurso, periodos);  
      
      await vincularDisciplinasAosAlunos(tx, idsAlunosDoCurso, idsNovos);

      return { message: "Atualizado com sucesso" };
    });
  },

}; 

const vincularDisciplinasAosAlunos = async (tx: TxClient, alunosDoCurso: number[], idsNovos: number[]) => {
  const disciplinas : { idAluno: number, idDisciplina: number }[] = [];

  alunosDoCurso.map( a => {
    idsNovos.map( d => {
      disciplinas.push({ idAluno: a, idDisciplina: d }); 
    });
  });

  await disciplinaRepository.inserirDisciplinasDoAluno(tx, disciplinas);
};

const vincularDisciplinasAoCurso = async (tx: TxClient, idCurso: number, periodos: PeriodoDTO[]) => {
  const dependenciasToCreate: { idDisciplinaDep: number; idTempDisciplinaReq: string }[] = [];
  const correqsToCreate: { idDisciplina: number; idTempDisciplinaCorreq: string }[] = [];
  const novosIdsDisciplinas: number[] = [];

  const tempToRealId = new Map<string, number>();

  for (const p of periodos) {
    for (const d of p.disciplinas) {
      if (!d) continue;

      const idTemp = `${p.numero}-${d.id}`;
      const created = await disciplinaRepository.criarDisciplina(tx, idCurso, d);
      tempToRealId.set(idTemp, created.id);

      d.preRequisitos?.forEach((e: string) =>
        dependenciasToCreate.push({ idDisciplinaDep: created.id, idTempDisciplinaReq: e })
      );

      d.coRequisitos?.forEach((e: string) =>
        correqsToCreate.push({ idDisciplina: created.id, idTempDisciplinaCorreq: e })
      );

      novosIdsDisciplinas.push(created.id);
    }
  }

  if (dependenciasToCreate.length) 
    await disciplinaRepository.criarDependencias(tx, dependenciasToCreate, tempToRealId);
  if (correqsToCreate.length) 
    await disciplinaRepository.criarCorrequisitos(tx, correqsToCreate, tempToRealId);

  return novosIdsDisciplinas;
}

export default courseService;

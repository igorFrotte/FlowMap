import { DuplicatedItemError, ForbiddenError, NotFoundError } from "../exceptions/erros.js";
import courseRepository from "../repositories/courseRepository.js";
import disciplinaRepository from "../repositories/disciplinaRepository.js";
import type { DisciplinaFormatoCriacao, PeriodoDTO } from "../types/disciplina.js";

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


      if(d.correquisitos)
        console.log(d.correquisitos);

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
    const { idUniversidade, nome, nPeriodos, periodos } = objeto;

    const cursoCriado = await courseRepository.criarCurso(idadm, idUniversidade, nome, nPeriodos);
    const idCurso = cursoCriado.id;
    const dependenciasToCreate: { idDisciplinaDep: number; idTempDisciplinaReq: string }[] = [];
    const correqsToCreate: { idDisciplina: number; idTempDisciplinaCorreq: string }[] = [];

    const tempToRealId = new Map<string, number>();

    for (const p of periodos) {
      for (const d of p.disciplinas) {
        if (!d) continue;

        const idTemp = `${p.numero}-${d.id}`;
        const created = await disciplinaRepository.criarDisciplina(idCurso, d);
        tempToRealId.set(idTemp, created.id);

        d.preRequisitos?.forEach((e: string) =>
          dependenciasToCreate.push({ idDisciplinaDep: created.id, idTempDisciplinaReq: e })
        );

        d.coRequisitos?.forEach((e: string) =>
          correqsToCreate.push({ idDisciplina: created.id, idTempDisciplinaCorreq: e })
        );
      }
    }

    if (dependenciasToCreate.length) 
      await disciplinaRepository.criarDependencias(dependenciasToCreate, tempToRealId);
    if (correqsToCreate.length) 
      await disciplinaRepository.criarCorrequisitos(correqsToCreate, tempToRealId);

    return cursoCriado;
  },

  /* atualizarCursoCompleto: async (idCurso: number, idadm: number, payload: { idUniversidade: number; nome: string; nPeriodos: number; periodos: PeriodoDTO[] }) => {
    const curso = await courseRepository.buscarCursoPeloIdComDisciplinas(idCurso);
    if (!curso) throw new NotFoundError("Curso não existe");
    if (curso.idadm !== idadm) throw new ForbiddenError("Curso não pertence ao ADM");

    await courseRepository.atualizarCurso(idCurso, { nome: payload.nome, iduniversidade: payload.idUniversidade, nperiodos: payload.nPeriodos });

    await disciplinaRepository.deletarDisciplinasPorCurso(idCurso);

    const periodos = payload.periodos;
    const tempToRealId = new Map<string, number>();

    for (const p of periodos) {
      for (let i = 0; i < (p.disciplinas || []).length; i++) {
        const d = p.disciplinas[i];
        const idTemp = `${p.numero}-${i}`;
        const created = await courseRepository.criarDisciplina(idCurso, {
          nome: d.nome,
          periodo: p.numero,
          credito: d.credito ?? 0,
          dificuldade: d.dificuldade ?? null,
          informacao: d.informacao ?? null,
          reqCreditos: d.reqCreditos ?? null,
          reqPeriodos: d.reqPeriodos ?? null,
        });
        tempToRealId.set(idTemp, created.id);
      }
    }

    const dependenciasToCreate: { iddisciplinareq: number; iddisciplinadep: number }[] = [];
    const correqsToCreate: { iddisciplina: number; iddisciplinacorreq: number }[] = [];

    for (const p of periodos) {
      for (let i = 0; i < (p.disciplinas || []).length; i++) {
        const d = p.disciplinas[i];
        const idTemp = `${p.numero}-${i}`;
        const idReal = tempToRealId.get(idTemp);
        if (!idReal) continue;

        (d.preRequisitos || []).forEach(pr => {
          const idReqReal = tempToRealId.get(pr);
          if (idReqReal) dependenciasToCreate.push({ iddisciplinareq: idReqReal, iddisciplinadep: idReal });
        });

        (d.coRequisitos || []).forEach(cr => {
          const idCorReal = tempToRealId.get(cr);
          if (idCorReal) correqsToCreate.push({ iddisciplina: idReal, iddisciplinacorreq: idCorReal });
        });
      }
    }

    if (dependenciasToCreate.length) await courseRepository.criarDependenciasBulk(dependenciasToCreate);
    if (correqsToCreate.length) await courseRepository.criarCorrequisitosBulk(correqsToCreate);

    return { message: "Atualizado com sucesso" };
  },
  */
}; 

export default courseService;

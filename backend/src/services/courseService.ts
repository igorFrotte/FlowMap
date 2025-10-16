import { DuplicatedItemError, NotFoundError } from "../exceptions/erros.js";
import courseRepository from "../repositories/courseRepository.js";

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
    const curso = await courseRepository.buscarCursoPeloId(idCurso);
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
  
};

export default courseService;

import disciplinaRepository from '../repositories/disciplinaRepository.js';
import type { DisciplinaComDeps } from '../types/disciplina.js';

const disciplinaService = {

  disciplinasComDepsDoAluno: async (idAluno : number): Promise<Record<number, DisciplinaComDeps>> => {
    const disciplinas = await disciplinaRepository.disciplinasComDependenciasDoAluno(idAluno);
    if (!disciplinas) throw new Error("Aluno não possui disciplinas vinculadas");
    return disciplinas.reduce((acc, d) => {
      acc[d.disciplina.id] = {
        id: d.disciplina.id,
        nome: d.disciplina.nome,
        periodo: d.disciplina.periodo,
        dificuldade: d.disciplina.dificuldade,
        informacao: d.disciplina.informacao,
        reqcreditos: d.disciplina.reqcreditos,
        reqperiodo: d.disciplina.reqperiodo,
        requisitos: d.disciplina.requisitos?.map(r => ({ id: r.req.id, nome: r.req.nome })) ?? [],
        dependentes: d.disciplina.dependentes?.map(dep => ({ id: dep.dep.id, nome: dep.dep.nome })) ?? [],
        correquisitos: d.disciplina.correquisitos?.map(dep => ({ id: dep.correq.id, nome: dep.correq.nome })) ?? [],
        aprovado: d.aprovado,
        periodoplan: d.periodoplan,
        credito: d.disciplina.credito
      };
      return acc;
    }, {} as Record<number, DisciplinaComDeps>);
  },

  updateAprovadasDoAluno: async (idAluno: number, idsDisciplinas: number[], aprovado: boolean) => {
    const result = await disciplinaRepository.updateDisciplinasAprovadasDoAluno(idAluno, idsDisciplinas, aprovado);
    return result;
  },

  updatePeriodoPlanDoAluno: async (periodos: {idsDisciplinas: number[], periodoPlan: number}[], idAluno: number) => {
    const results = await disciplinaRepository.updateDisciplinasPeriodoPlanDoAluno(periodos, idAluno);
    return results;
  }

};

export default disciplinaService;

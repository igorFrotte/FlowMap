import disciplinaRepository from '../repositories/disciplinaRepository.js';
import type { DisciplinaComDeps } from '../types/disciplina.js';

const disciplinaService = {

  disciplinasComDepsDoAluno: async (idAluno : number): Promise<Record<number, DisciplinaComDeps>> => {
    const disciplinas = await disciplinaRepository.disciplinasComDependenciasDoAluno(idAluno);
  
    return disciplinas.reduce((acc, d) => {
      acc[d.disciplina.id] = {
        id: d.disciplina.id,
        nome: d.disciplina.nome,
        periodo: d.disciplina.periodo,
        dificuldade: d.disciplina.dificuldade,
        informacao: d.disciplina.informacao,
        reqcreditos: d.disciplina.reqcreditos,
        requisitos: d.disciplina.requisitos?.map(r => ({ id: r.req.id, nome: r.req.nome })) ?? [],
        dependentes: d.disciplina.dependentes?.map(dep => ({ id: dep.dep.id, nome: dep.dep.nome })) ?? [],
        aprovado: d.aprovado,
        periodoplan: d.periodoplan
      };
      return acc;
    }, {} as Record<number, DisciplinaComDeps>);
  },

  updateAprovadasDoAluno: async (idAluno: number, idsDisciplinas: number[], aprovado: boolean) => {
    const result = await disciplinaRepository.updateDisciplinasAprovadasDoAluno(idAluno, idsDisciplinas, aprovado);
    return result;
  },

  updatePeriodoPlanDoAluno: async (idAluno: number, idsDisciplinas: number[], periodoPlan: number) => {
    const result = await disciplinaRepository.updateDisciplinasPeriodoPlanDoAluno(idAluno, idsDisciplinas, periodoPlan);
    return result; 
  }

};

export default disciplinaService;

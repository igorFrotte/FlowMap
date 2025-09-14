import { disciplinasRepository } from '../repositories/disciplinaRepository.js';
import type { DisciplinaComDeps } from '../types/disciplina.js';

export async function disciplinasComDepsDoAluno(alunoId : number): Promise<DisciplinaComDeps[]> {
  const disciplinas = await disciplinasRepository.disciplinasComDependenciasDoAluno(alunoId);

  return disciplinas.map(d => ({
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
  }));
};

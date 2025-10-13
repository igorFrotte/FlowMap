import authRepository from '../repositories/authRepository.js';
import disciplinaRepository from '../repositories/disciplinaRepository.js';
import prisma from '../prisma/client.js';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  idcurso: number | null;
  tipo: "aluno" | "admin";
}

const authService = {
  verificarEmail: async (email: string) : Promise<Usuario | null> => {
    const aluno = await authRepository.listarAlunoPorEmail(email);
    if (aluno)
      return { ...aluno, tipo: "aluno" };
  
    const adm = await authRepository.listarAdmPorEmail(email);
    if (adm)
      return { ...adm, tipo: "admin", idcurso: null };
  
    return null;
  },

  criarAluno: async (email: string, nome: string, idCurso: number, senha: string) => {
    return prisma.$transaction(async (tx) => {
      const aluno = await authRepository.criarAluno(email, nome, idCurso, senha, tx);

      const disciplinas = await disciplinaRepository.disciplinasDoCurso(idCurso, tx);

      const disciplinasAluno = disciplinas.map(d => ({
        idAluno: aluno.id,
        idDisciplina: d.id,
      }));

      await disciplinaRepository.inserirDisciplinasDoAluno(disciplinasAluno, tx);

      return aluno;
    });
  },
};

export default authService;

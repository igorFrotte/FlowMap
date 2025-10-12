import authRepository from '../repositories/authRepository.js';
import disciplinaRepository from '../repositories/disciplinaRepository.js';
import prisma from '../prisma/client.js';

const authService = {
  verificarEmail: async (email: string) => {
    const results = await authRepository.listarEmailSenha(email);
    return results;
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

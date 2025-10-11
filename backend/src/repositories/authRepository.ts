import prisma from '../prisma/client.js';

const authRepository = {
  
  listarEmailSenha: async (email : string) => {
    return prisma.aluno.findFirst({
      where: { email }
    });
  }
};

export default authRepository;
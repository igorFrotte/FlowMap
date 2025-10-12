import prisma from '../prisma/client.js';

const courseRepository = {
  cursosDaUniversidade: async (idUniversidade: number) => {
    return prisma.curso.findMany({ where: { iduniversidade: idUniversidade } });
  },

  listarUniversidades: async () => {
    return prisma.universidade.findMany({});
  },

};

export default courseRepository;
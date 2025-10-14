import prisma from '../prisma/client.js';

const courseRepository = {
  cursosDaUniversidade: async (idUniversidade: number) => {
    return prisma.curso.findMany({ where: { iduniversidade: idUniversidade } });
  },

  cursosDoADM: async (idADM: number) => {
    return prisma.curso.findMany({
      where: { idadm: idADM },
      include: { universidade: true },
    });
  },

  listarUniversidades: async () => {
    return prisma.universidade.findMany({});
  },

};

export default courseRepository;
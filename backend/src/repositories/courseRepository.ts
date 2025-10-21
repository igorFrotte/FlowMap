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

  criarUniversidade: async (nome: string) => {
    return prisma.universidade.create({
      data: { nome },
    });
  },

  buscarUniversidadePeloNome: async (nome: string) => {
    return prisma.universidade.findUnique({
      where: { nome },
    });
  },

  buscarCursoPeloIdComDisciplinas: async (idCurso: number) => {
    return prisma.curso.findUnique({
      where: { id: idCurso },
      include: {
        disciplinas: {
          include: {
            requisitos: { include: { req: true } }, 
            dependentes: { include: { dep: true } }, 
            correquisitos: { include: { correq: true } }, 
          },
        },
      },
    });
  },

  criarCurso: async (idadm: number, idUniversidade: number, nome: string, nperiodos: number) => {
    return prisma.curso.create({
      data: {
        idadm,
        iduniversidade: idUniversidade,
        nome,
        nperiodos,
      },
    });
  },

  atualizarCurso: async (idCurso: number, data: { nome?: string; iduniversidade?: number; nperiodos?: number }) => {
    return prisma.curso.update({
      where: { id: idCurso },
      data
    });
  },
};

export default courseRepository;
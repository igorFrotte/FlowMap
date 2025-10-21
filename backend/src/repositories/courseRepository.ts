import type { PrismaClient } from '../generated/prisma/index.js';
import prisma from '../prisma/client.js';
import type { TxClient } from '../types/prisma.js';

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
            correquisitos: { include: { correq: true } }, 
          },
        },
      },
    });
  },

  criarCurso: async (tx: TxClient = prisma, idadm: number, idUniversidade: number, nome: string, nperiodos: number) => {
    return tx.curso.create({
      data: {
        idadm,
        iduniversidade: idUniversidade,
        nome,
        nperiodos,
      },
    });
  },

  atualizarCurso: async (tx: TxClient = prisma, idCurso: number, data: { nome?: string; iduniversidade?: number; nperiodos?: number }) => {
    return tx.curso.update({
      where: { id: idCurso },
      data
    });
  },
};

export default courseRepository;
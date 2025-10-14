import courseRepository from "../repositories/courseRepository.js";

const courseService = {
  listarUniversidades: async () => {
    return courseRepository.listarUniversidades();
  },

  cursosDaUniversidade: async (idUniversidade: number) => {
    return courseRepository.cursosDaUniversidade(idUniversidade);
  },

  cursosDaADM: async (idADM: number) => {
    return courseRepository.cursosDoADM(idADM);
  },
};

export default courseService;

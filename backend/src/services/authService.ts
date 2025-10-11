import authRepository from '../repositories/authRepository.js';

const authService = {
  verificarEmail: async (email: string) => {
    const results = await authRepository.listarEmailSenha(email);
    return results;
  },
};

export default authService;

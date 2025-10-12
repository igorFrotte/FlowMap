import axios from 'axios';

const BASE_URL = "http://localhost:5000/"; //mudar

interface FlowMap {
  userId: number;
  userName: string;
  userCourseId: number;
  token: string;
}

const axiosService = {
  signUp: (body: {email: string, password: string, nome: string, idCurso: number}) => {
    const promise = axios.post(BASE_URL + "sign-up", body);
    return promise;
  },
  
  signIn: (body: {email: string, password: string}) => {
    const promise = axios.post(BASE_URL + "sign-in", body);
    return promise;
  },

  validToken: () => {
    const header = createHeader();
    const promise = axios.get(BASE_URL + "token", header);
    return promise;
  },

  mostrarUniversidades: () => {
    const promise = axios.get(BASE_URL + "universidades");
    return promise;
  },

  mostrarCursosByUniversidade: (idUniversidade: number) => {
    const promise = axios.get(BASE_URL + "cursos/" + idUniversidade);
    return promise;
  },
  
  mostrarDisciplinasDoAluno: () => {
    const header = createHeader();
    const promise = axios.get(BASE_URL + "disciplinas", header);
    return promise;
  },

  mudarAprovacao: (body: {idsDisciplinas: number[], aprovado: boolean}) => {
    const header = createHeader();
    const promise = axios.patch(BASE_URL + "disciplinas/aprovadas", body, header);
    return promise;
  },

  mudarPlanejamento: (body: {idsDisciplinas: number[], periodoPlan: number}[]) => {
    const header = createHeader();
    const promise = axios.patch(BASE_URL + "disciplinas/periodoplan", body, header);
    return promise;
  },

};

const createHeader = () => {
  const flowMapString = localStorage.getItem("FlowMap");
  if (!flowMapString) {
    return {};
  }

  const flowMap: FlowMap = JSON.parse(flowMapString);
  if (!flowMap.token) {
    return {};
  }

  const config = {
    headers: {
      Authorization: `Bearer ${flowMap.token}`,
    },
  };
  return config;
};

export default axiosService;

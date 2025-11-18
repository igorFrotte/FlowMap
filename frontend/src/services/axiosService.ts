import axios from 'axios';

const BASE_URL = "http://localhost:5000/"; //mudar

interface FlowMap {
  userId: number;
  userName: string;
  userCourseId: number;
  token: string;
}

interface Disciplina {
  id: number;
  nome: string;
  periodo: number;
  credito?: number;
  dificuldade?: number;
  informacao?: string;
  reqCreditos?: number;
  reqPeriodos?: number;
  preRequisitos?: string[]; 
  coRequisitos?: string[];
}

interface Periodo {
  numero: number;
  disciplinas: Disciplina[];
}

interface Curso {
  id?: number;
  nome: string;
  idUniversidade: number;
  periodos: Periodo[];
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
    const promise = axios.get(BASE_URL + "universidade");
    return promise;
  },

  mostrarCursosDaUniversidade: (idUniversidade: number) => {
    const promise = axios.get(BASE_URL + "curso/universidade/" + idUniversidade);
    return promise;
  },

  mostrarUniversidadeDoCurso: (idCurso: number) => {
    const promise = axios.get(BASE_URL + "universidade/" + idCurso);
    return promise;
  },

  mostrarCursosDoADM: () => {
    const header = createHeader();
    const promise = axios.get(BASE_URL + "curso/adm", header);
    return promise;
  },

  buscarCursoPeloId: ( idCurso: number) => {
    const header = createHeader();
    const promise = axios.get(BASE_URL + "curso/" + idCurso, header);
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

  mudarPlanejamento: (body: {idsDisciplinas: number[], periodoPlan: number | null}[]) => {
    const header = createHeader();
    const promise = axios.patch(BASE_URL + "disciplinas/periodoplan", body, header);
    return promise;
  },

  criarCurso: (body : Curso) => {
    const header = createHeader();
    const promise = axios.post(BASE_URL + "curso", body, header);
    return promise;
  },

  atualizarCurso: (idCurso : string, body : Curso) => {
    const header = createHeader();
    const promise = axios.put(BASE_URL + "curso/" + idCurso, body, header);
    return promise;
  },

  criarUniversidade: (body: {nome: string}) => {
    const header = createHeader();
    const promise = axios.post(BASE_URL + "universidade", body, header);
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

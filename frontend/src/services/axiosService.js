import axios from 'axios';

const BASE_URL = "http://localhost:5000/"; //mudar

const axiosService = {

    createHeader: () => {
        const auth = JSON.parse(localStorage.getItem("FlowMap"));
        const config = {
          headers: { Authorization: `Bearer ${auth.token}` }
        };
        return config;
    },
    
    mostrarDisciplinasDoAluno: () => {
        //const header = createHeader();
        const promise = axios.get(BASE_URL + "disciplinas/1");
        return promise;
      }
};

export default axiosService;

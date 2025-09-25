import { styled } from "styled-components";
import Disciplina from "./Disciplina";
import { useEffect, useState } from "react";
import axiosService from "../services/axiosService";
import Planejador from "./Planejador";

interface Disciplina {
  id: number;
  nome: string;
  periodo: number;
  dificuldade?: string | null;
  informacao?: string | null;
  reqcreditos?: number | null;
  requisitos: { id: number; nome: string }[];
  dependentes: { id: number; nome: string }[];
  aprovado: boolean;
  periodoplan?: number | null;
  borda?: string;
}

interface Dependencia {
  id: number;
  nome: string;
}

export default function Fluxograma() {
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [disciplinas,setDisciplinas] = useState<Record<string, Disciplina>>({});

  useEffect(() => {
    const promise = axiosService.mostrarDisciplinasDoAluno();
        promise
            .then(r => setDisciplinas(r.data))
            .catch(e => console.log(e.message));
  },[]);

  function disciplinasPorPeriodo() {
    const obj = [];
    let aux = true;

    for(let i=1; aux; i++){
      obj[i] = Object.values(disciplinas).filter( (e) => e.periodo === i);
      if(obj[i].length === 0){
        aux = false;
        obj.pop(); //remove o último vazio
      }
    }; 

    return obj;
  }

  function disciplinaClicada(id : number){
    disciplinas[id].aprovado = !disciplinas[id].aprovado;
    if(disciplinas[id].aprovado)
      recursivamenteAprovado(id);
    setDisciplinas({...disciplinas});
  }

  function recursivamenteAprovado(id : number){
    disciplinas[id].requisitos.map((d) => {
      disciplinas[d.id].aprovado = true;
      recursivamenteAprovado(d.id);
    });
  }

  function dependenciasDaDisciplina(dep : Dependencia[], tipo: "requisitos" | "dependentes"){

    dependencias.map( (d) => {
      let n : string = d.id.toString();
      disciplinas[n].borda = "";
    });

    if(JSON.stringify(dependencias) === JSON.stringify(dep)){
      setDependencias([]);
      return;
    }

    dep.map((d) => {
      let n : string = d.id.toString();
      disciplinas[n].borda = tipo === "requisitos" ? "reqs" : "deps";
    });
    setDependencias([...dep]);
  }

  function freeSubs(){}
  
  return (
    <>
      iniciando TSX
      <Container>
        {disciplinasPorPeriodo().map((d,ind) => {       
          return <div key={ind}>
                      <div>{d[0].periodo}º Período</div>
                      {d.map((dis,i) => <Disciplina click={disciplinaClicada} key={i} disciplina={dis} funcaoDependencia={dependenciasDaDisciplina} />)}
                  </div>;
        })}
      </Container> 
      <Menu>
        <div>
          <button onClick={() => freeSubs()}>Livres</button>
        </div>
      </Menu>

      {Object.keys(disciplinas).length > 0 && (
        <Planejador dadosBackend={disciplinas} />
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  
  & > div {
      margin: 10px;
      text-align: center;

      & > div {
          margin: 5px;
      }
  }
`;

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;

  div {
    margin-bottom: 10px;
  }

  button {
    width: 100px;
    height: 50px;
    background-color: #373;
    cursor: pointer;
    border-radius: 10px;
    margin: 0 10px;
  }
`;
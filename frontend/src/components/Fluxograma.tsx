import { styled } from "styled-components";
import Disciplina from "./Disciplina";
import { useEffect, useState } from "react";
import axiosService from "../services/axiosService";
import { Link } from "react-router-dom";

interface Disciplina {
  id: number;
  nome: string;
  periodo: number;
  dificuldade?: string | null;
  informacao?: string | null;
  reqcreditos?: number | null;
  reqperiodo?: number | null;
  correquisitos: { id: number; nome: string }[];
  requisitos: { id: number; nome: string }[];
  dependentes: { id: number; nome: string }[];
  aprovado: boolean;
  periodoplan?: number | null;
  borda?: string;
  credito: number;
}

interface Dependencia {
  id: number;
  nome: string;
}

interface ObjetoAprovado {
  idsDisciplinas: number[];
  aprovado: boolean;
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
    const obj = {
      idsDisciplinas: [id], 
      aprovado: !disciplinas[id].aprovado
    };
    disciplinas[id].aprovado = !disciplinas[id].aprovado;
    if(disciplinas[id].aprovado)
      recursivamenteAprovado(id, obj);
    const promise = axiosService.mudarAprovacao(obj);
        promise
            .then(() => setDisciplinas({...disciplinas}))
            .catch(e => console.log(e.message));
  }

  function recursivamenteAprovado(id : number, obj : ObjetoAprovado){
    disciplinas[id].requisitos.map((d) => {
      disciplinas[d.id].aprovado = true;
      obj.idsDisciplinas.push(d.id);
      recursivamenteAprovado(d.id, obj);
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
  
  return (
    <Page>
      <Container>
        {disciplinasPorPeriodo().map((d,ind) => {       
          return <div key={ind}>
                      <div>{d[0].periodo}º Período</div>
                      {d.map((dis,i) => <Disciplina click={disciplinaClicada} key={i} disciplina={dis} funcaoDependencia={dependenciasDaDisciplina} />)}
                  </div>;
        })}
      </Container> 
      <Menu>
          <Link to="/planejador"><button>Planejador</button></Link>
      </Menu>
    </Page>
  );
}

const Page = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

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
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  gap: 20px;

  button {
    color: white;
    width: 130px;
    height: 40px;
    background-color: #0056b3;
    cursor: pointer;
    border-radius: 10px;
    font-size: 15px;
  }
`;
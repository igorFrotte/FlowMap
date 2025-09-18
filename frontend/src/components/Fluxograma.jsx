import { styled } from "styled-components";
import Disciplina from "./Disciplina";
import { useEffect, useState } from "react";
import axiosService from "../services/axiosService.js";

export default function Fluxograma() {
  const [dependencias, setDependencias] = useState([]);
  const [disciplinas,setDisciplinas] = useState([]);

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

  /*
  subjects[11][7] = "Correquisito de Circuitos Digitais";
  subjects[21][7] = "Correquisito de Física 3 - A";
  subjects[38][7] = "Requer 1440hrs cursadas";
  subjects[39][7] = "Requer 1440hrs cursadas";
  subjects[40][7] = "Requer 1440hrs cursadas";

  function clearSubs( item, ind ){
    clearFree();
    if(item !== null){
      subjects[item][ind].map((e) => {
        if(subjects[e][5] === 1)
          subjects[e][4] = "#ddd";
        else subjects[e][4] = "#fff";
        return 1;
      });
    }
  }

  function clearFree(){
    subjects.map((e) => {
      if(e[4] === "#4dd"){
        if(e[5])
          e[4] = "#ddd";
        else e[4] = "#fff";
      }
      return 1;
    });
  }

  function freeSubs(){
    clearSubs(req, 2);
    clearSubs(isReq, 3);
    if(!free){
      subjects.map((e, i) => {
        let ready = e[2].filter((el) => subjects[el][5] === 0);
        if(ready.length === 0 && e[5] === 0)
          e[4] = "#4dd";
        return 1;
      });
    }
    setFree(!free);
    setSubjects([...subjects]);
    return 1;
  } */

  function disciplinaClicada(id){
    disciplinas[id].aprovado = !disciplinas[id].aprovado;
    if(disciplinas[id].aprovado)
      recursivamenteAprovado(id);
    setDisciplinas({...disciplinas});
  }

  function recursivamenteAprovado(id){
    disciplinas[id].requisitos.map((d) => {
      disciplinas[d.id].aprovado = true;
      recursivamenteAprovado(d.id);
    });
  }

  function dependenciasDaDisciplina(dep, tipo){
    setDependencias([...dep]);
    dep.map((d) => {
      let n = d.id.toString();
      if(tipo == "requisitos")
        disciplinas[n]["borda"] = "#c849d3";
      else disciplinas[n]["borda"] = "#34c21b";
    });
    //setDisciplinas({...disciplinas});
  }

  function freeSubs(){}
  
  return (
    <>
      iniciando
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
import styled from "styled-components";

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

interface DisciplinaFuncs {
  disciplina: Disciplina;
  click: (id: number) => void;
  funcaoDependencia: (
    dep: { id: number; nome: string }[],
    tipo: "requisitos" | "dependentes"
  ) => void;
}

interface SubProps {
  $borda?: string;
  $aprovado?: boolean;
}

export default function Disciplina( {disciplina, click, funcaoDependencia} : DisciplinaFuncs) {

  return (
    <Container>
      {disciplina.requisitos.length? <p className="before" onClick={() => funcaoDependencia(disciplina.requisitos, "requisitos")}>{"<-"}</p>: ""}
      {disciplina.dependentes.length? <p className="after" onClick={() => funcaoDependencia(disciplina.dependentes, "dependentes")}>{"->"}</p> : ""}
      {disciplina.informacao? <p className="desc" onClick={() => alert(disciplina.informacao)}>{"i"}</p> : ""}
      <Sub onClick={() => click(disciplina.id)} $borda={disciplina.borda} $aprovado={disciplina.aprovado}>
        {disciplina.nome}
      </Sub>
    </Container> 
  );
}

const Sub = styled.div<SubProps>`
  border: 5px ${props => (props.$borda? (props.$borda === "deps"? "#4980d3" : "#f2da23") : "black")} solid;
  padding: 5px;
  border-radius: 10px;
  width: 150px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
  background-color: ${props => (props.$aprovado? "#ccc" : "#fff")};
`;

const Container = styled.div`
  position: relative;

  & > p {
    position: absolute;
    bottom: 5px;
    width: 15px;
    height: 15px;
    cursor: pointer;
    border-radius: 25%;
    font-size: 10px;
  }

  .before {
    left: 5px;
    background-color: #a5a;
  }

  .after {
    right: 5px;
    background-color: #aa5;
  }

  .desc {
    left: calc(50% - 8px);
    background-color: #5aa;
  }
`;

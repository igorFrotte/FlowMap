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
  $aprovado?: boolean;
  $cursando?: number | null;
}

interface Container {
  $borda?: string;
}

export default function Disciplina( {disciplina, click, funcaoDependencia} : DisciplinaFuncs) {

  return (
    <Container $borda={disciplina.borda}>
      {disciplina.requisitos.length? <Dep className="before" onClick={() => funcaoDependencia(disciplina.requisitos, "requisitos")}>{"<"}</Dep>: <div></div>}
      {disciplina.informacao? <p className="desc" title={disciplina.informacao}>{"i"}</p> : ""}
      <Sub onClick={() => click(disciplina.id)} $aprovado={disciplina.aprovado} $cursando = {disciplina.periodoplan}>
        {disciplina.nome}
      </Sub>
      {disciplina.dependentes.length? <Dep className="after" onClick={() => funcaoDependencia(disciplina.dependentes, "dependentes")}>{">"}</Dep> : <div></div>}
    </Container> 
  );
}

const Dep = styled.div`
  width: 15px;
  height: 100%;
  cursor: pointer;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Sub = styled.div<SubProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  height: 100%;
  width: 100%;
  padding: 5px 10px;
  cursor: pointer;
  background-color: ${props => (props.$aprovado? "#d5e2f1" : props.$cursando == 1? "#d2ead1" : "#eceef3")};
`;

const Container = styled.div<Container>`
  border-radius: 5px;
  width: 160px;
  height: 90px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 5px ${props => (props.$borda? (props.$borda === "deps"? "#c52be0" : "#fae757") : "#2974c5")} solid;

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
    background-color: #a8c4e1;
  }

  .after {
    background-color: #a8c4e1;
  }

  .desc {
    left: calc(50% - 8px);
    background-color: #5584aa;
  }
`;

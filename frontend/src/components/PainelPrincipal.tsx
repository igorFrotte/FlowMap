import { useEffect, useState } from "react";
import axiosService from "../services/axiosService";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

interface Universidade {
  id: number;
  nome: string;
}

interface Curso {
  id: number;
  nome: string;
  idAdm: number;
  idUniversidade: number;
  nPeriodos: number;
  universidade?: Universidade;
  _count?: { alunos: number};
}

export default function PainelPrincipal() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosService.mostrarCursosDoADM()
      .then(res => setCursos(res.data))
      .catch(err => console.error("Erro ao buscar cursos:", err));
  }, []);

  return (
    <Container>
      <Title>Cursos Gerenciados</Title>

      <ButtonNovo onClick={() => navigate("/adm/curso/novo")}>
        + Novo Curso
      </ButtonNovo>

      {cursos.length === 0 ? (
        <TextoVazio>Nenhum curso encontrado.</TextoVazio>
      ) : (
        <Lista>
          {cursos.map(c => (
            <ItemLista
              key={c.id}
              onClick={() => navigate(`/adm/curso/${c.id}`)}
            >
              {c.nome}{" "}
              <UniversidadeNome>
                ({c.universidade?.nome || "Sem universidade"})
              </UniversidadeNome>
              <Alunos>{c._count?.alunos} alunos vinculados</Alunos>
            </ItemLista>
          ))}
        </Lista>
      )}
    </Container>
  );
}

const Container = styled.div`
  padding: 32px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
`;

const ButtonNovo = styled.button`
  background-color: #1d4ed8; /* azul */
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  margin-bottom: 10px;
  font-size: 14px;

  &:hover {
    background-color: #1e40af;
  }
`;

const TextoVazio = styled.p`
  font-size: 16px;
`;

const Lista = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: 8px;
`;

const ItemLista = styled.li`
  padding: 12px;
  border: 1px solid #2c4976;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
  }

  & + & {
    margin-top: 10px;
  }
`;

const UniversidadeNome = styled.span`
  color: #6b7280;
  font-size: 14px;
`;

const Alunos = styled.div`
  color: #2f3034;
  font-size: 16px;
  margin-top: 5px;
`;

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axiosService from "../services/axiosService";
import { useNavigate } from "react-router-dom";

export default function CadastroAluno() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [universidades, setUniversidades] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [universidadeSelecionada, setUniversidadeSelecionada] = useState("");
  const [idCurso, setIdCurso] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Carrega universidades ao montar
  useEffect(() => {
    axiosService
      .mostrarUniversidades()
      .then((res) => {
        setUniversidades(res.data);
      })
      .catch(() => {
        setError("Erro ao carregar universidades.");
      });
  }, []);

  // Carrega cursos ao selecionar universidade
  useEffect(() => {
    if (!universidadeSelecionada) {
      setCursos([]);
      setIdCurso("");
      return;
    }

    axiosService
      .mostrarCursosByUniversidade(Number(universidadeSelecionada))
      .then((res) => {
        setCursos(res.data);
      })
      .catch(() => {
        setError("Erro ao carregar cursos.");
      });
  }, [universidadeSelecionada]);

  const validate = (): boolean => {
    if (!nome.trim() || !email.trim() || !senha.trim() || !idCurso.trim()) {
      setError("Preencha todos os campos.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Digite um email válido.");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    const body = { email, password:senha, nome, idCurso: Number(idCurso)};

    axiosService
      .signUp(body)
      .then(() => {
        navigate("/login");
      })
      .catch((err) => {
        if (err.response?.status === 409) {
          setError("Email já cadastrado.");
        } else {
          setError("Erro ao cadastrar. Tente novamente.");
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Title>Cadastrar</Title>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <Input
          type="text"
          placeholder="Nome completo"
          value={nome}
          $hasError={!!error && !nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <Input
          type="email"
          placeholder="Email"
          value={email}
          $hasError={!!error && !email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Senha"
          value={senha}
          $hasError={!!error && !senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <Select
          value={universidadeSelecionada}
          onChange={(e) => setUniversidadeSelecionada(e.target.value)}
        >
          <option value="">Selecione a universidade</option>
          {universidades.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome}
            </option>
          ))}
        </Select>

        {universidadeSelecionada && (
          <Select
            value={idCurso}
            onChange={(e) => setIdCurso(e.target.value)}
            disabled={!cursos.length}
          >
            <option value="">Selecione o curso</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Button>

        <Redirect onClick={() => navigate("/login")}>
          Já tem uma conta? Faça login
        </Redirect>
      </Form>
    </Container>
  );
}

// ======== STYLES =========

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f8f9fa;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid ${({ $hasError }) => ($hasError ? "#e63946" : "#ccc")};
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #007bff;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #007bff;
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #0056b3;
  }
`;

const ErrorMsg = styled.p`
  color: #e63946;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const Redirect = styled.p`
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #007bff;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

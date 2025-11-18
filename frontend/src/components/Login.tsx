import React, { useState } from "react";
import styled from "styled-components";
import axiosService from "../services/axiosService";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logoFlowMap.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    if (!email.trim() || !password.trim()) {
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
  
    const body = { email, password };

    axiosService
    .signIn(body)
    .then((response) => {
      localStorage.setItem("FlowMap", JSON.stringify(response.data));
      
      const userType = response.data.tipo;

      if (userType === "admin") {
        navigate("/adm");
      } else {
        navigate("/fluxograma");
      }
    })
    .catch((err) => {
      if (err.response?.status === 401) {
        setError("Email ou senha incorretos.");
      } else {
        setError("Erro ao conectar com o servidor.");
      }
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <Container>

      <img src={logo} alt="FlowMap Logo" /> 

      <Form onSubmit={handleSubmit}>
        <Title>Entrar</Title>

        {error && <ErrorMsg>{error}</ErrorMsg>}

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
          value={password}
          $hasError={!!error && !password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </Form>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  height: 100vh;
  flex-direction: column;

  img {
    height: 180px;
    width: auto;
    border-radius: 10px;
    margin: 80px 0 40px 0;
  }
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
  font-size: 24px;
  font-weight: bold;
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

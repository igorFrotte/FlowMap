import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosService from "../services/axiosService";
import Header from "./Header";

interface PrivatePageProps {
  children: React.ReactNode;
  allowed: ("aluno" | "admin")[];
}

export default function PrivatePage({ children, allowed }: PrivatePageProps) {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function checkAuth() {
    const flowMap = localStorage.getItem("FlowMap");

    if (!flowMap)
      return handleUnauthorized();

    try {
      const authData = JSON.parse(flowMap);

      if (!authData || !authData.token)
        return handleUnauthorized();

      await axiosService.validToken();

      const userType = authData.tipo;
      if (!allowed.includes(userType))
        return handleUnauthorized();

      setIsAuthorized(true);
    } catch (error) {
      handleUnauthorized();
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  function handleUnauthorized() {
    alert("Sessão expirada. Faça login novamente.");
    localStorage.removeItem("FlowMap");
    setTimeout(() => navigate("/login"), 500);
  }

  if (isLoading) {
    return (
      <div>
        <Header />
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <p>Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div>
      <Header />
      {children}
    </div>
  );
}
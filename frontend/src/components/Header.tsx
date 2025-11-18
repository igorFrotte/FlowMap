import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logoFlowMap.png";

interface UserData {
  userId: number;
  userName: string;
  userCourseId: number;
  tipo: string;
  token: string;
}

const Header: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem("FlowMap");
    if (data) {
      try {
        setUser(JSON.parse(data));
      } catch (error) {
        console.error("Erro ao ler userData do localStorage:", error);
      }
    }
  }, []);

  function logout() {
    localStorage.removeItem("FlowMap");
    navigate("/login");
  }

  return (
    <HeaderComp>
      <LogoArea>
        <img src={logo} alt="FlowMap Logo" />
        <h1>FlowMap</h1>
      </LogoArea>

      <RightArea>
        {user && (
          <>
            <RoleTag>{user.tipo}</RoleTag>
            <span>{user.userName}</span>
          </>
        )}

        <LogoutButton onClick={logout}>
          Sair
        </LogoutButton>
      </RightArea>
    </HeaderComp>
  );
};

export default Header;
const HeaderComp = styled.header`
  background-color: #0056b3;
  height: 60px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);

  a {
    text-decoration: none;
  }
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  img {
    height: 36px;
    width: auto;
  }

  h1 {
    color: white;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
`;

const RightArea = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  span {
    color: #ffffff;
    font-size: 16px;
    font-weight: 500;
    text-transform: capitalize;
  }
`;

const RoleTag = styled.div`
  background-color: #ffffff33;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  text-transform: capitalize;
`;

const LogoutButton = styled.button`
  background-color: #ffffff22;
  border: 1px solid #ffffff55;
  padding: 6px 12px;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;

  &:hover {
    background-color: #ffffff44;
  }
`;

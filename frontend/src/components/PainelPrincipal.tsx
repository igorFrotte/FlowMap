import { useEffect, useState } from "react";
import axiosService from "../services/axiosService";
import { useNavigate } from "react-router-dom";

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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cursos Gerenciados</h1>
      <button
        onClick={() => navigate("/adm/curso/novo")}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-6"
      >
        + Novo Curso
      </button>

      {cursos.length === 0 ? (
        <p>Nenhum curso encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {cursos.map(c => (
            <li
              key={c.id}
              className="p-3 border rounded cursor-pointer hover:bg-gray-100"
              onClick={() => navigate(`/adm/curso/${c.id}`)}
            >
              {c.nome}{" "}
              <span className="text-gray-500">
                ({c.universidade?.nome || "Sem universidade"})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


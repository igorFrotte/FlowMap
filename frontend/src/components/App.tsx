import { BrowserRouter, Routes, Route } from "react-router-dom";
import Fluxograma from "./Fluxograma";
import Planejador from "./Planejador";
import PrivatePage from "./PrivatePage";
import Home from "./Home";
import Login from "./Login";
import CadastroAluno from "./CadastroAluno";
import PainelPrincipal from "./PainelPrincipal";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<CadastroAluno />} />
          <Route path="/fluxograma" element={<PrivatePage allowed={["aluno"]}><Fluxograma /></PrivatePage>} />
          <Route path="/planejador" element={<PrivatePage allowed={["aluno"]}><Planejador /></PrivatePage>} />
          <Route path="/admin" element={<PrivatePage allowed={["admin"]}><PainelPrincipal /></PrivatePage>} />
        </Routes>
      </BrowserRouter>
    </> 
  );
}
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Fluxograma from "./Fluxograma";
import Planejador from "./Planejador";
import PrivatePage from "./PrivatePage";
import Home from "./Home";
import Login from "./Login";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/fluxograma" element={<PrivatePage><Fluxograma /></PrivatePage>} />
          <Route path="/planejador" element={<PrivatePage><Planejador /></PrivatePage>} />
        </Routes>
      </BrowserRouter>
    </> 
  );
}
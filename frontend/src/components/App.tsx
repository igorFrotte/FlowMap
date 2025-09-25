import { BrowserRouter, Routes, Route } from "react-router-dom";
import Fluxograma from "./Fluxograma";
import Planejador from "./Planejador";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Fluxograma />} />
          <Route path="/planejador" element={<Planejador />} />
        </Routes>
      </BrowserRouter>
    </> 
  );
}
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import ClientiPage from "./pages/ClientiPage.jsx";
import FatturePage from "./pages/FatturePage.jsx";
import NavbarApp from "./components/NavbarApp.jsx";
import UtentiPage from "./pages/UtentiPage.jsx";
import StatiFatturaPage from "./pages/StatiFatturaPage.jsx";

function App() {
  return (
    <>
      <NavbarApp />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/clienti" element={<ClientiPage />} />
        <Route path="/fatture" element={<FatturePage />} />
        <Route path="/utenti" element={<UtentiPage />} />
        <Route path="/stati-fattura" element={<StatiFatturaPage />} />
      </Routes>
    </>
  );
}

export default App;

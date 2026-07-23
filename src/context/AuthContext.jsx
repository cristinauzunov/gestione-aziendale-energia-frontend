import { createContext, useContext, useState } from "react";

// Creo il context

const AuthContext = createContext();

// Provider che avvolge tutta l'app e tiene token + utente

export function AuthProvider({ children }) {
  // Leggo dal localStorage all'avvio: così dopo un refresh resto loggata

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [utente, setUtente] = useState(() => {
    const salvato = localStorage.getItem("utente");
    return salvato ? JSON.parse(salvato) : null;
  });

  // Chiamata dopo il login: salvo token e utente nello stato e nel localStorage

  function login(nuovoToken, datiUtente) {
    setToken(nuovoToken);
    setUtente(datiUtente);
    localStorage.setItem("token", nuovoToken);
    localStorage.setItem("utente", JSON.stringify(datiUtente));
  }

  // Logout: pulisco tutto

  function logout() {
    setToken(null);
    setUtente(null);
    localStorage.removeItem("token");
    localStorage.removeItem("utente");
  }

  // Comodo per mostrare/nascondere i pulsanti da ADMIN

  const isAdmin =
    utente && utente.ruoli
      ? utente.ruoli.some((ruolo) => ruolo.nome === "ROLE_ADMIN")
      : false;

  return (
    <AuthContext.Provider value={{ token, utente, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook per usare il context senza importare useContext ogni volta

export function useAuth() {
  return useContext(AuthContext);
}

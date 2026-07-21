// Indirizzo base del backend Spring Boot (gira su IntelliJ, porta 3001)
export const BASE_URL = "http://localhost:3001";

// Header con il token JWT, da usare nelle chiamate protette
export function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
}

// Funzione generica per chiamare il backend.
// endpoint: es. "/clienti"  |  opzioni: metodo, body, token
export async function chiamataApi(endpoint, opzioni = {}) {
  const { metodo = "GET", body = null, token = null } = opzioni;

  const headers = token
    ? authHeaders(token)
    : { "Content-Type": "application/json" };

  const config = { method: metodo, headers: headers };
  if (body) {
    config.body = JSON.stringify(body);
  }

  const risposta = await fetch(BASE_URL + endpoint, config);

  if (!risposta.ok) {
    throw new Error("Errore nella chiamata: " + risposta.status);
  }

  // Se la risposta è 204  non c'è JSON da leggere
  if (risposta.status === 204) {
    return null;
  }

  return await risposta.json();
}
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

  // Alcune risposte non hanno contenuto (es. DELETE, invio email):
  // leggo il testo e faccio il parse solo se c'è davvero qualcosa
  const testo = await risposta.text();
  if (!testo) {
    return null;
  }
  return JSON.parse(testo);
}

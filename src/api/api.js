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

  // Preparo gli header: se ho un token lo aggiungo, altrimenti solo il content-type
  const headers = token
    ? authHeaders(token)
    : { "Content-Type": "application/json" };

  // Costruisco la configurazione della chiamata
  const config = { method: metodo, headers: headers };
  if (body) {
    config.body = JSON.stringify(body);
  }

  // Faccio la chiamata
  const risposta = await fetch(BASE_URL + endpoint, config);

  // Se il backend risponde con errore, lancio un'eccezione da gestire nella pagina
  if (!risposta.ok) {
    throw new Error("Errore nella chiamata: " + risposta.status);
  }

  // Restituisco i dati in formato JSON
  return await risposta.json();
}
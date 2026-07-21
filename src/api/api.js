// Indirizzo base del backend Spring Boot (gira su IntelliJ)

export const BASE_URL = "http://localhost:3001";

// Header con il token JWT, da usare nelle chiamate protette

export function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
}
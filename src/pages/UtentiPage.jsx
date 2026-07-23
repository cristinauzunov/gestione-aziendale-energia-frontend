import { useState, useEffect } from "react";
import { Table, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { chiamataApi } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import UtenteModal from "../components/UtenteModal.jsx";
import RuoliUtenteModal from "../components/RuoliUtenteModal.jsx";
import AvatarModal from "../components/AvatarModal.jsx";

function UtentiPage() {
  const { token } = useAuth();

  const [utenti, setUtenti] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalePagine, setTotalePagine] = useState(0);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState(null);

  async function caricaUtenti(paginaDaCaricare) {
    try {
      setCaricamento(true);
      setErrore(null);

      const dati = await chiamataApi(
        "/utenti?page=" + paginaDaCaricare + "&size=10",
        { token },
      );
      setUtenti(dati.content);
      setTotalePagine(dati.totalPages);
    } catch (err) {
      setErrore("Impossibile caricare gli utenti. Serve un account ADMIN.");
    } finally {
      setCaricamento(false);
    }
  }

  useEffect(() => {
    caricaUtenti(pagina);
  }, [pagina]);

  async function eliminaUtente(id) {
    const conferma = window.confirm("Vuoi eliminare questo utente?");
    if (!conferma) return;

    try {
      await chiamataApi("/utenti/" + id, { metodo: "DELETE", token });
      caricaUtenti(pagina);
    } catch (err) {
      setErrore("Impossibile eliminare l'utente.");
    }
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Utenti</h2>
        <UtenteModal onSalvato={() => caricaUtenti(pagina)} />
      </div>

      {caricamento && <Spinner animation="border" />}
      {errore && <Alert variant="danger">{errore}</Alert>}

      {!caricamento && !errore && (
        <>
          {utenti.length === 0 ? (
            <Alert variant="info">Nessun utente trovato.</Alert>
          ) : (
            <>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Nome</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Ruoli</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {utenti.map((utente) => (
                    <tr key={utente.id}>
                      <td>
                        <img
                          src={utente.avatar}
                          alt={utente.username}
                          className="rounded-circle"
                          style={{ width: "40px", height: "40px" }}
                        />
                      </td>
                      <td>
                        {utente.nome} {utente.cognome}
                      </td>
                      <td>{utente.username}</td>
                      <td>{utente.email}</td>
                      <td>
                        {utente.ruoli.map((ruolo) => (
                          <Badge
                            bg="secondary"
                            className="me-1"
                            key={ruolo.nome}
                          >
                            {ruolo.nome}
                          </Badge>
                        ))}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <UtenteModal
                            utente={utente}
                            onSalvato={() => caricaUtenti(pagina)}
                          />
                          <RuoliUtenteModal
                            utente={utente}
                            onSalvato={() => caricaUtenti(pagina)}
                          />
                          <AvatarModal
                            utente={utente}
                            onSalvato={() => caricaUtenti(pagina)}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => eliminaUtente(utente.id)}
                          >
                            Elimina
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-between align-items-center">
                <Button
                  variant="secondary"
                  disabled={pagina === 0}
                  onClick={() => setPagina(pagina - 1)}
                >
                  Precedente
                </Button>
                <span>
                  Pagina {pagina + 1} di {totalePagine}
                </span>
                <Button
                  variant="secondary"
                  disabled={pagina + 1 >= totalePagine}
                  onClick={() => setPagina(pagina + 1)}
                >
                  Successiva
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default UtentiPage;

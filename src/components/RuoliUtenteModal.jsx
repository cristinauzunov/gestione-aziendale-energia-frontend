import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Badge } from "react-bootstrap";
import { chiamataApi } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function RuoliUtenteModal({ utente, onSalvato }) {
  const { token } = useAuth();

  const [aperto, setAperto] = useState(false);
  const [errore, setErrore] = useState(null);
  const [esito, setEsito] = useState(null);

  const [ruoliDisponibili, setRuoliDisponibili] = useState([]);
  const [ruoloDaAggiungere, setRuoloDaAggiungere] = useState("");
  const [ruoliUtente, setRuoliUtente] = useState([]);

  useEffect(() => {
    if (!aperto) return;

    setErrore(null);
    setEsito(null);
    setRuoloDaAggiungere("");
    setRuoliUtente(utente.ruoli);
    caricaRuoli();
  }, [aperto]);

  async function caricaRuoli() {
    try {
      const dati = await chiamataApi("/ruoli", { token });
      setRuoliDisponibili(dati);
    } catch (err) {
      setErrore("Impossibile caricare i ruoli.");
    }
  }

  // Assegno un ruolo all'utente
  async function aggiungiRuolo() {
    try {
      setEsito(null);
      const aggiornato = await chiamataApi(
        "/utenti/" + utente.id + "/ruolo?nuovoNomeRuolo=" + ruoloDaAggiungere,
        { metodo: "PATCH", token: token },
      );
      // Il backend mi restituisce l'utente aggiornato: uso i suoi ruoli
      setRuoliUtente(aggiornato.ruoli);
      setRuoloDaAggiungere("");
      setEsito({ tipo: "success", testo: "Ruolo assegnato." });
      onSalvato();
    } catch (err) {
      setEsito({ tipo: "danger", testo: "Impossibile assegnare il ruolo." });
    }
  }

  // Rimuovo un ruolo dall'utente
  async function rimuoviRuolo(nomeRuolo) {
    try {
      setEsito(null);
      const aggiornato = await chiamataApi(
        "/utenti/" + utente.id + "/ruolo?nomeRuolo=" + nomeRuolo,
        { metodo: "DELETE", token: token },
      );
      setRuoliUtente(aggiornato.ruoli);
      setEsito({ tipo: "success", testo: "Ruolo rimosso." });
      onSalvato();
    } catch (err) {
      setEsito({ tipo: "danger", testo: "Impossibile rimuovere il ruolo." });
    }
  }

  // Nella tendina mostro solo i ruoli che l'utente non ha gia'
  function ruoliAssegnabili() {
    const risultato = [];
    for (let i = 0; i < ruoliDisponibili.length; i++) {
      const ruolo = ruoliDisponibili[i];
      let giaPresente = false;
      for (let j = 0; j < ruoliUtente.length; j++) {
        if (ruoliUtente[j].nome === ruolo.nome) {
          giaPresente = true;
        }
      }
      if (!giaPresente) {
        risultato.push(ruolo);
      }
    }
    return risultato;
  }

  return (
    <>
      <Button variant="outline-dark" size="sm" onClick={() => setAperto(true)}>
        Ruoli
      </Button>

      <Modal show={aperto} onHide={() => setAperto(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Ruoli di {utente.nome} {utente.cognome}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errore && <Alert variant="danger">{errore}</Alert>}
          {esito && <Alert variant={esito.tipo}>{esito.testo}</Alert>}

          <h6>Ruoli attuali</h6>
          {ruoliUtente.length === 0 ? (
            <p className="text-muted">Nessun ruolo assegnato.</p>
          ) : (
            <div className="mb-4">
              {ruoliUtente.map((ruolo) => (
                <div
                  key={ruolo.nome}
                  className="d-flex justify-content-between align-items-center border rounded p-2 mb-2"
                >
                  <Badge bg="secondary">{ruolo.nome}</Badge>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => rimuoviRuolo(ruolo.nome)}
                  >
                    Rimuovi
                  </Button>
                </div>
              ))}
            </div>
          )}

          <h6>Assegna un nuovo ruolo</h6>
          <div className="d-flex gap-2">
            <Form.Select
              value={ruoloDaAggiungere}
              onChange={(e) => setRuoloDaAggiungere(e.target.value)}
            >
              <option value="">Seleziona un ruolo...</option>
              {ruoliAssegnabili().map((ruolo) => (
                <option key={ruolo.nome} value={ruolo.nome}>
                  {ruolo.nome}
                </option>
              ))}
            </Form.Select>
            <Button
              variant="primary"
              onClick={aggiungiRuolo}
              disabled={!ruoloDaAggiungere}
            >
              Assegna
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAperto(false)}>
            Chiudi
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default RuoliUtenteModal;

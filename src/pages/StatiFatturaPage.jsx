import { useState, useEffect } from "react";
import { Table, Button, Spinner, Alert, Form, Row, Col } from "react-bootstrap";
import { chiamataApi } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function StatiFatturaPage() {
  const { token } = useAuth();

  const [stati, setStati] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState(null);

  const [nuovoNome, setNuovoNome] = useState("");
  const [esito, setEsito] = useState(null);

  // Tengo traccia di quale riga sto modificando e del testo in corso
  const [idInModifica, setIdInModifica] = useState(null);
  const [nomeModificato, setNomeModificato] = useState("");

  async function caricaStati() {
    try {
      setCaricamento(true);
      setErrore(null);
      const dati = await chiamataApi("/stati-fattura?page=0&size=50", {
        token,
      });
      setStati(dati.content);
    } catch (err) {
      setErrore("Impossibile caricare gli stati fattura.");
    } finally {
      setCaricamento(false);
    }
  }

  useEffect(() => {
    caricaStati();
  }, []);

  async function creaStato() {
    try {
      setEsito(null);
      await chiamataApi("/stati-fattura", {
        metodo: "POST",
        body: { nome: nuovoNome },
        token: token,
      });
      setEsito({ tipo: "success", testo: "Stato creato con successo!" });
      setNuovoNome("");
      caricaStati();
    } catch (err) {
      setEsito({ tipo: "danger", testo: "Impossibile creare lo stato." });
    }
  }

  // Attivo la modifica su una riga, precompilando il campo
  function iniziaModifica(stato) {
    setIdInModifica(stato.id);
    setNomeModificato(stato.nome);
    setEsito(null);
  }

  // Annullo la modifica senza salvare
  function annullaModifica() {
    setIdInModifica(null);
    setNomeModificato("");
  }

  // Salvo la modifica sul backend
  async function salvaModifica(id) {
    try {
      setEsito(null);
      await chiamataApi("/stati-fattura/" + id, {
        metodo: "PUT",
        body: { nome: nomeModificato },
        token: token,
      });
      setEsito({ tipo: "success", testo: "Stato modificato con successo!" });
      annullaModifica();
      caricaStati();
    } catch (err) {
      setEsito({ tipo: "danger", testo: "Impossibile modificare lo stato." });
    }
  }

  async function eliminaStato(id) {
    const conferma = window.confirm("Vuoi eliminare questo stato?");
    if (!conferma) return;

    try {
      await chiamataApi("/stati-fattura/" + id, { metodo: "DELETE", token });
      caricaStati();
    } catch (err) {
      setEsito({ tipo: "danger", testo: "Impossibile eliminare lo stato." });
    }
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Stati fattura</h2>

      <Form className="mb-4 p-3 border rounded bg-light">
        <Row className="g-3 align-items-end">
          <Col md={6}>
            <Form.Label>Nuovo stato</Form.Label>
            <Form.Control
              type="text"
              value={nuovoNome}
              onChange={(e) => setNuovoNome(e.target.value)}
              placeholder="Es. SOLLECITATA"
            />
          </Col>
          <Col md={3}>
            <Button
              variant="primary"
              onClick={creaStato}
              disabled={nuovoNome.length < 2 || nuovoNome.length > 30}
            >
              Aggiungi stato
            </Button>
          </Col>
        </Row>

        {esito && (
          <Alert variant={esito.tipo} className="mt-3 mb-0">
            {esito.testo}
          </Alert>
        )}
      </Form>

      {caricamento && <Spinner animation="border" />}
      {errore && <Alert variant="danger">{errore}</Alert>}

      {!caricamento && !errore && (
        <>
          {stati.length === 0 ? (
            <Alert variant="info">Nessuno stato trovato.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {stati.map((stato) => (
                  <tr key={stato.id}>
                    <td>
                      {/* Se sto modificando questa riga mostro il campo, altrimenti il testo */}
                      {idInModifica === stato.id ? (
                        <Form.Control
                          type="text"
                          value={nomeModificato}
                          onChange={(e) => setNomeModificato(e.target.value)}
                        />
                      ) : (
                        stato.nome
                      )}
                    </td>
                    <td>
                      {idInModifica === stato.id ? (
                        <div className="d-flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => salvaModifica(stato.id)}
                            disabled={
                              nomeModificato.length < 2 ||
                              nomeModificato.length > 30
                            }
                          >
                            Salva
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={annullaModifica}
                          >
                            Annulla
                          </Button>
                        </div>
                      ) : (
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => iniziaModifica(stato)}
                          >
                            Modifica
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => eliminaStato(stato.id)}
                          >
                            Elimina
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}

export default StatiFatturaPage;

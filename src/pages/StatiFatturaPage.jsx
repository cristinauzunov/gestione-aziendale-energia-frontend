import { useState, useEffect } from "react";
import { Table, Button, Spinner, Alert, Form, Row, Col } from "react-bootstrap";
import { chiamataApi } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function StatiFatturaPage() {
  const { token } = useAuth();

  const [stati, setStati] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState(null);

  // Campo del form per creare un nuovo stato
  const [nuovoNome, setNuovoNome] = useState("");
  const [esito, setEsito] = useState(null);

  async function caricaStati() {
    try {
      setCaricamento(true);
      setErrore(null);
      // Ne chiedo 50 per averli tutti in una pagina sola
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

  // Crea un nuovo stato e ricarica la lista
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

  // Elimina uno stato dopo conferma
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

      {/* Form per creare un nuovo stato */}
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
            <Button variant="primary" onClick={creaStato} disabled={!nuovoNome}>
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
                    <td>{stato.nome}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => eliminaStato(stato.id)}
                      >
                        Elimina
                      </Button>
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

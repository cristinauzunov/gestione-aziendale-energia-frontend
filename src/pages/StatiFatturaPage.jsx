import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Spinner,
  Alert,
  Form,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { FaTrash, FaEdit, FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import { chiamataApi } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function StatiFatturaPage() {
  const { token } = useAuth();

  const [stati, setStati] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState(null);

  const [nuovoNome, setNuovoNome] = useState("");
  const [esito, setEsito] = useState(null);

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

  // Stesso schema di colori usato nella tabella fatture
  function coloreStato(nomeStato) {
    if (nomeStato === "PAGATA") return "success";
    if (nomeStato === "NON PAGATA" || nomeStato === "SCADUTA") return "danger";
    if (nomeStato === "EMESSA") return "primary";
    return "warning";
  }

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

  function iniziaModifica(stato) {
    setIdInModifica(stato.id);
    setNomeModificato(stato.nome);
    setEsito(null);
  }

  function annullaModifica() {
    setIdInModifica(null);
    setNomeModificato("");
  }

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
              variant="success"
              onClick={creaStato}
              disabled={nuovoNome.length < 2 || nuovoNome.length > 30}
            >
              <FaPlus className="me-2" />
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
            <Table hover responsive className="align-middle">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th className="text-center">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {stati.map((stato) => (
                  <tr key={stato.id}>
                    <td>
                      {idInModifica === stato.id ? (
                        <Form.Control
                          type="text"
                          size="sm"
                          style={{ maxWidth: "300px" }}
                          value={nomeModificato}
                          onChange={(e) => setNomeModificato(e.target.value)}
                        />
                      ) : (
                        <Badge
                          bg={coloreStato(stato.nome)}
                          className="rounded-pill"
                        >
                          {stato.nome}
                        </Badge>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        {idInModifica === stato.id ? (
                          <>
                            <Button
                              variant="outline-success"
                              size="sm"
                              title="Salva"
                              onClick={() => salvaModifica(stato.id)}
                              disabled={
                                nomeModificato.length < 2 ||
                                nomeModificato.length > 30
                              }
                            >
                              <FaCheck />
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              title="Annulla"
                              onClick={annullaModifica}
                            >
                              <FaTimes />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              title="Modifica"
                              onClick={() => iniziaModifica(stato)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              title="Elimina"
                              onClick={() => eliminaStato(stato.id)}
                            >
                              <FaTrash />
                            </Button>
                          </>
                        )}
                      </div>
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

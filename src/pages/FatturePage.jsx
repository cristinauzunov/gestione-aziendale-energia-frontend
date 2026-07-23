import { useState, useEffect } from "react";
import { Table, Button, Spinner, Alert, Form, Row, Col } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { chiamataApi } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import FatturaModal from "../components/FatturaModal.jsx";

function FatturePage() {
  const { token } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const clienteId = searchParams.get("clienteId");

  const [fatture, setFatture] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalePagine, setTotalePagine] = useState(0);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState(null);

  const [statiDisponibili, setStatiDisponibili] = useState([]);
  const [esito, setEsito] = useState(null);

  const [stato, setStato] = useState("");
  const [data, setData] = useState("");
  const [anno, setAnno] = useState("");
  const [minImporto, setMinImporto] = useState("");
  const [maxImporto, setMaxImporto] = useState("");

  async function caricaFatture(paginaDaCaricare) {
    try {
      setCaricamento(true);
      setErrore(null);

      const params = new URLSearchParams();
      params.append("page", paginaDaCaricare);
      params.append("size", "10");
      if (clienteId) params.append("clienteId", clienteId);
      if (stato) params.append("stato", stato);
      if (data) params.append("data", data);
      if (anno) params.append("anno", anno);
      if (minImporto) params.append("minImporto", minImporto);
      if (maxImporto) params.append("maxImporto", maxImporto);

      const dati = await chiamataApi("/fatture?" + params.toString(), {
        token,
      });
      setFatture(dati.content);
      setTotalePagine(dati.totalPages);
    } catch (err) {
      setErrore(
        "Impossibile caricare le fatture. Controlla di aver effettuato il login.",
      );
    } finally {
      setCaricamento(false);
    }
  }

  async function caricaStati() {
    try {
      const dati = await chiamataApi("/stati-fattura?page=0&size=50", {
        token,
      });
      setStatiDisponibili(dati.content);
    } catch (err) {
      // se non riesco a caricarli la tendina resta vuota, ma la pagina funziona
    }
  }

  useEffect(() => {
    caricaFatture(pagina);
  }, [pagina, clienteId]);

  useEffect(() => {
    caricaStati();
  }, []);

  function applicaFiltri() {
    setPagina(0);
    caricaFatture(0);
  }

  function azzeraFiltri() {
    setStato("");
    setData("");
    setAnno("");
    setMinImporto("");
    setMaxImporto("");
    setPagina(0);
  }

  // Cambio solo lo stato: la PUT vuole tutti i campi, quindi rimando gli altri invariati
  async function cambiaStato(fattura, nuovoStatoId) {
    try {
      setEsito(null);
      await chiamataApi("/fatture/" + fattura.id, {
        metodo: "PUT",
        body: {
          data: fattura.data,
          numero: fattura.numero,
          importo: fattura.importo,
          clienteId: fattura.cliente.id,
          statoFatturaId: nuovoStatoId,
        },
        token: token,
      });
      setEsito({ tipo: "success", testo: "Stato della fattura aggiornato." });
      caricaFatture(pagina);
    } catch (err) {
      setEsito({ tipo: "danger", testo: "Impossibile aggiornare lo stato." });
    }
  }

  async function eliminaFattura(id) {
    const conferma = window.confirm("Vuoi eliminare questa fattura?");
    if (!conferma) return;

    try {
      await chiamataApi("/fatture/" + id, { metodo: "DELETE", token });
      caricaFatture(pagina);
    } catch (err) {
      setErrore("Impossibile eliminare la fattura.");
    }
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Fatture</h2>
        <FatturaModal onSalvato={() => caricaFatture(pagina)} />
      </div>

      {clienteId && (
        <Alert
          variant="info"
          className="d-flex justify-content-between align-items-center"
        >
          <span>Stai vedendo le fatture di un singolo cliente.</span>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setSearchParams({})}
          >
            Mostra tutte
          </Button>
        </Alert>
      )}

      <Form className="mb-4 p-3 border rounded bg-light">
        <Row className="g-3">
          <Col md={4}>
            <Form.Label>Stato</Form.Label>
            <Form.Control
              type="text"
              value={stato}
              onChange={(e) => setStato(e.target.value)}
              placeholder="Es. PAGATA"
            />
          </Col>
          <Col md={4}>
            <Form.Label>Data</Form.Label>
            <Form.Control
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Label>Anno</Form.Label>
            <Form.Control
              type="number"
              value={anno}
              onChange={(e) => setAnno(e.target.value)}
              placeholder="Es. 2026"
            />
          </Col>
          <Col md={4}>
            <Form.Label>Importo minimo</Form.Label>
            <Form.Control
              type="number"
              value={minImporto}
              onChange={(e) => setMinImporto(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Label>Importo massimo</Form.Label>
            <Form.Control
              type="number"
              value={maxImporto}
              onChange={(e) => setMaxImporto(e.target.value)}
            />
          </Col>
        </Row>

        <div className="mt-3">
          <Button variant="primary" onClick={applicaFiltri} className="me-2">
            Filtra
          </Button>
          <Button variant="outline-secondary" onClick={azzeraFiltri}>
            Azzera
          </Button>
        </div>
      </Form>

      {esito && <Alert variant={esito.tipo}>{esito.testo}</Alert>}

      {caricamento && <Spinner animation="border" />}
      {errore && <Alert variant="danger">{errore}</Alert>}

      {!caricamento && !errore && (
        <>
          {fatture.length === 0 ? (
            <Alert variant="info">Nessuna fattura trovata.</Alert>
          ) : (
            <>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Numero</th>
                    <th>Data</th>
                    <th>Importo</th>
                    <th>Cliente</th>
                    <th>Stato</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {fatture.map((fattura) => (
                    <tr key={fattura.id}>
                      <td>{fattura.numero}</td>
                      <td>{fattura.data}</td>
                      <td>€ {fattura.importo}</td>
                      <td>{fattura.cliente.ragioneSociale}</td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={fattura.statoFattura.id}
                          onChange={(e) => cambiaStato(fattura, e.target.value)}
                        >
                          {statiDisponibili.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nome}
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <FatturaModal
                            fattura={fattura}
                            onSalvato={() => caricaFatture(pagina)}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => eliminaFattura(fattura.id)}
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

export default FatturePage;

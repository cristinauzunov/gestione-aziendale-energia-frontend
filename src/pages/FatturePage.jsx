import { useState, useEffect } from "react";
import { Table, Button, Spinner, Alert, Form, Row, Col } from "react-bootstrap";
import { chiamataApi } from "../api/api.js";

function FatturePage() {
  const [fatture, setFatture] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalePagine, setTotalePagine] = useState(0);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState(null);

  // Stato dei filtri (quelli che il backend accetta)
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
      if (stato) params.append("stato", stato);
      if (data) params.append("data", data);
      if (anno) params.append("anno", anno);
      if (minImporto) params.append("minImporto", minImporto);
      if (maxImporto) params.append("maxImporto", maxImporto);

      const dati = await chiamataApi("/fatture?" + params.toString());
      setFatture(dati.content);
      setTotalePagine(dati.totalPages);
    } catch (err) {
      setErrore("Impossibile caricare le fatture. Controlla che il backend sia avviato.");
    } finally {
      setCaricamento(false);
    }
  }

  useEffect(() => {
    caricaFatture(pagina);
  }, [pagina]);

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

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Fatture</h2>

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
              placeholder="Es. 2025"
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

      {caricamento && <Spinner animation="border" />}
      {errore && <Alert variant="danger">{errore}</Alert>}

      {!caricamento && !errore && (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Numero</th>
                <th>Data</th>
                <th>Importo</th>
                <th>Cliente</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              {fatture.map((fattura) => (
                <tr key={fattura.id}>
                  <td>{fattura.numero}</td>
                  <td>{fattura.data}</td>
                  <td>{fattura.importo}</td>
                  {/* cliente è un oggetto: mostro la ragione sociale */}
                  <td>{fattura.cliente.ragioneSociale}</td>
                  {/* statoFattura è un oggetto: mostro il nome (verifica il campo!) */}
                  <td>{fattura.statoFattura.nome}</td>
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
    </div>
  );
}

export default FatturePage;
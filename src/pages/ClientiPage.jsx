import { useState, useEffect } from "react";
import { Table, Button, Spinner, Alert, Form, Row, Col } from "react-bootstrap";
import { chiamataApi } from "../api/api.js";

function ClientiPage() {
  // Lista dei clienti della pagina corrente
  const [clienti, setClienti] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalePagine, setTotalePagine] = useState(0);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState(null);

  // Stato dei filtri e dell'ordinamento
  const [nome, setNome] = useState("");
  const [minFatturato, setMinFatturato] = useState("");
  const [maxFatturato, setMaxFatturato] = useState("");
  const [dataInserimento, setDataInserimento] = useState("");
  const [dataUltimoContatto, setDataUltimoContatto] = useState("");
  const [sortBy, setSortBy] = useState("ragioneSociale");

  // Carico i clienti dal backend, costruendo la query con i filtri attivi
  async function caricaClienti(paginaDaCaricare) {
    try {
      setCaricamento(true);
      setErrore(null);

      // URLSearchParams costruisce la stringa "?page=0&size=10&..." per me
      const params = new URLSearchParams();
      params.append("page", paginaDaCaricare);
      params.append("size", "10");
      params.append("sortBy", sortBy);
      // Aggiungo un filtro solo se è stato compilato
      if (nome) params.append("nome", nome);
      if (minFatturato) params.append("minFatturato", minFatturato);
      if (maxFatturato) params.append("maxFatturato", maxFatturato);
      if (dataInserimento) params.append("dataInserimento", dataInserimento);
      if (dataUltimoContatto) params.append("dataUltimoContatto", dataUltimoContatto);

      const dati = await chiamataApi("/clienti?" + params.toString());
      setClienti(dati.content);
      setTotalePagine(dati.totalPages);
    } catch (err) {
      setErrore("Impossibile caricare i clienti. Controlla che il backend sia avviato.");
    } finally {
      setCaricamento(false);
    }
  }

  // Ricarico ogni volta che cambia la pagina
  useEffect(() => {
    caricaClienti(pagina);
  }, [pagina]);

  // Quando premo "Filtra": torno a pagina 0 e ricarico con i filtri
  function applicaFiltri() {
    setPagina(0);
    caricaClienti(0);
  }

  // Azzera tutti i filtri e ricarica la lista pulita
  function azzeraFiltri() {
    setNome("");
    setMinFatturato("");
    setMaxFatturato("");
    setDataInserimento("");
    setDataUltimoContatto("");
    setSortBy("ragioneSociale");
    setPagina(0);
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Clienti</h2>

      {/* Sezione filtri */}
      <Form className="mb-4 p-3 border rounded bg-light">
        <Row className="g-3">
          <Col md={4}>
            <Form.Label>Nome (ragione sociale)</Form.Label>
            <Form.Control
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Parte del nome..."
            />
          </Col>
          <Col md={4}>
            <Form.Label>Fatturato minimo</Form.Label>
            <Form.Control
              type="number"
              value={minFatturato}
              onChange={(e) => setMinFatturato(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Label>Fatturato massimo</Form.Label>
            <Form.Control
              type="number"
              value={maxFatturato}
              onChange={(e) => setMaxFatturato(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Label>Data inserimento</Form.Label>
            <Form.Control
              type="date"
              value={dataInserimento}
              onChange={(e) => setDataInserimento(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Label>Data ultimo contatto</Form.Label>
            <Form.Control
              type="date"
              value={dataUltimoContatto}
              onChange={(e) => setDataUltimoContatto(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Label>Ordina per</Form.Label>
            <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="ragioneSociale">Nome</option>
              <option value="fatturatoAnnuale">Fatturato annuale</option>
              <option value="dataInserimento">Data inserimento</option>
              <option value="dataUltimoContatto">Data ultimo contatto</option>
            </Form.Select>
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
                <th>Ragione sociale</th>
                <th>Partita IVA</th>
                <th>Email</th>
                <th>Fatturato annuale</th>
              </tr>
            </thead>
            <tbody>
              {clienti.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.ragioneSociale}</td>
                  <td>{cliente.partitaIva}</td>
                  <td>{cliente.email}</td>
                  <td>{cliente.fatturatoAnnuale}</td>
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

export default ClientiPage;
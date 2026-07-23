import { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert, Form, Row, Col } from "react-bootstrap";
import { chiamataApi } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import InviaEmailModal from "../components/InviaEmailModal.jsx";
import DettaglioClienteModal from "../components/DettaglioClienteModal.jsx";

function ClientiPage() {
  const { token } = useAuth();

  const [clienti, setClienti] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalePagine, setTotalePagine] = useState(0);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState(null);

  const [nome, setNome] = useState("");
  const [minFatturato, setMinFatturato] = useState("");
  const [maxFatturato, setMaxFatturato] = useState("");
  const [dataInserimento, setDataInserimento] = useState("");
  const [dataUltimoContatto, setDataUltimoContatto] = useState("");
  const [sortBy, setSortBy] = useState("ragioneSociale");

  async function caricaClienti(paginaDaCaricare) {
    try {
      setCaricamento(true);
      setErrore(null);

      const params = new URLSearchParams();
      params.append("page", paginaDaCaricare);
      params.append("size", "10");
      params.append("sortBy", sortBy);
      if (nome) params.append("nome", nome);
      if (minFatturato) params.append("minFatturato", minFatturato);
      if (maxFatturato) params.append("maxFatturato", maxFatturato);
      if (dataInserimento) params.append("dataInserimento", dataInserimento);
      if (dataUltimoContatto)
        params.append("dataUltimoContatto", dataUltimoContatto);

      const dati = await chiamataApi("/clienti?" + params.toString(), {
        token,
      });
      setClienti(dati.content);
      setTotalePagine(dati.totalPages);
    } catch (err) {
      setErrore(
        "Impossibile caricare i clienti. Controlla di aver effettuato il login.",
      );
    } finally {
      setCaricamento(false);
    }
  }

  useEffect(() => {
    caricaClienti(pagina);
  }, [pagina]);

  function applicaFiltri() {
    setPagina(0);
    caricaClienti(0);
  }

  function azzeraFiltri() {
    setNome("");
    setMinFatturato("");
    setMaxFatturato("");
    setDataInserimento("");
    setDataUltimoContatto("");
    setSortBy("ragioneSociale");
    setPagina(0);
  }

  async function eliminaCliente(id) {
    const conferma = window.confirm(
      "Sei sicura di voler eliminare questo cliente?",
    );
    if (!conferma) return;

    try {
      await chiamataApi("/clienti/" + id, { metodo: "DELETE", token });
      caricaClienti(pagina);
    } catch (err) {
      setErrore("Impossibile eliminare il cliente.");
    }
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Clienti</h2>

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
            <Form.Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
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
          {clienti.length === 0 ? (
            <Alert variant="info">Nessun cliente trovato.</Alert>
          ) : (
            <>
              <Row xs={1} md={2} lg={3} className="g-4">
                {clienti.map((cliente) => (
                  <Col key={cliente.id}>
                    <Card className="h-100 shadow-sm">
                      <Card.Img
                        variant="top"
                        src={cliente.logoAziendale}
                        className="p-3 bg-light"
                        style={{ height: "160px", objectFit: "contain" }}
                      />
                      <Card.Body className="d-flex flex-column">
                        <Card.Title>{cliente.ragioneSociale}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">
                          P.IVA: {cliente.partitaIva}
                        </Card.Subtitle>
                        <Card.Text as="div">
                          <div>{cliente.email}</div>
                          <div>
                            <strong>Fatturato:</strong> €{" "}
                            {cliente.fatturatoAnnuale}
                          </div>
                        </Card.Text>
                        <div className="mt-auto d-flex gap-2 flex-wrap">
                          <DettaglioClienteModal cliente={cliente} />
                          <InviaEmailModal clienteId={cliente.id} />
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => eliminaCliente(cliente.id)}
                          >
                            Elimina
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              <div className="d-flex justify-content-between align-items-center mt-4">
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

export default ClientiPage;

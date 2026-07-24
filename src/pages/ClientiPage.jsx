import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Spinner,
  Alert,
  Form,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaTrash, FaFileInvoice, FaPlus } from "react-icons/fa";
import { chiamataApi } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import InviaEmailModal from "../components/InviaEmailModal.jsx";
import DettaglioClienteModal from "../components/DettaglioClienteModal.jsx";
import ClienteModal from "../components/ClienteModal.jsx";

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

  // Colore del badge in base al tipo di cliente
  function coloreTipo(tipo) {
    if (tipo === "PA") return "primary";
    if (tipo === "SRL") return "success";
    if (tipo === "SPA") return "warning";
    return "info";
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Clienti</h2>
        <ClienteModal onSalvato={() => caricaClienti(pagina)} />
      </div>

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
                    <Card className="h-100">
                      <Card.Img
                        variant="top"
                        src={cliente.logoAziendale}
                        className="p-3"
                        style={{ height: "150px", objectFit: "contain" }}
                      />
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Card.Title className="mb-0">
                            {cliente.ragioneSociale}
                          </Card.Title>
                          <Badge
                            bg={coloreTipo(cliente.tipoCliente)}
                            className="rounded-pill"
                          >
                            {cliente.tipoCliente}
                          </Badge>
                        </div>

                        <div className="text-muted small mb-3">
                          <div>P.IVA {cliente.partitaIva}</div>
                          <div>{cliente.email}</div>
                        </div>

                        <div className="fs-5 fw-semibold mb-3">
                          € {cliente.fatturatoAnnuale}
                        </div>

                        {/* Azioni in fila, solo icone */}
                        <div className="mt-auto d-flex gap-2">
                          <DettaglioClienteModal cliente={cliente} />
                          <ClienteModal
                            cliente={cliente}
                            onSalvato={() => caricaClienti(pagina)}
                          />
                          <Button
                            as={Link}
                            to={"/fatture?clienteId=" + cliente.id}
                            variant="outline-success"
                            size="sm"
                            title="Vedi fatture"
                          >
                            <FaFileInvoice />
                          </Button>
                          <InviaEmailModal clienteId={cliente.id} />
                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Elimina"
                            onClick={() => eliminaCliente(cliente.id)}
                          >
                            <FaTrash />
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

import { useState, useEffect } from "react";
import { Card, Row, Col, Spinner, Alert, Table, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaUsers, FaFileInvoice, FaUserShield, FaTags } from "react-icons/fa";
import { chiamataApi } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function DashboardPage() {
  const { token, utente } = useAuth();

  const [totaleClienti, setTotaleClienti] = useState(0);
  const [totaleFatture, setTotaleFatture] = useState(0);
  const [totaleUtenti, setTotaleUtenti] = useState(0);
  const [totaleStati, setTotaleStati] = useState(0);
  const [fattureAnno, setFattureAnno] = useState(0);

  const [ultimeFatture, setUltimeFatture] = useState([]);
  const [topClienti, setTopClienti] = useState([]);
  const [ultimiClienti, setUltimiClienti] = useState([]);
  // Per ogni stato tengo nome e conteggio
  const [conteggioStati, setConteggioStati] = useState([]);

  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState(null);

  // L'anno di oggi, per il conteggio delle fatture dell'anno
  const annoCorrente = new Date().getFullYear();

  async function caricaDati() {
    try {
      setCaricamento(true);
      setErrore(null);

      const clienti = await chiamataApi("/clienti?page=0&size=1", { token });
      setTotaleClienti(clienti.totalElements);

      const utenti = await chiamataApi("/utenti?page=0&size=1", { token });
      setTotaleUtenti(utenti.totalElements);

      const fatture = await chiamataApi("/fatture?page=0&size=5", { token });
      setTotaleFatture(fatture.totalElements);
      setUltimeFatture(fatture.content);

      // Fatture dell'anno corrente
      const diQuestAnno = await chiamataApi(
        "/fatture?page=0&size=1&anno=" + annoCorrente,
        { token },
      );
      setFattureAnno(diQuestAnno.totalElements);

      const perFatturato = await chiamataApi(
        "/clienti?page=0&size=5&sortBy=fatturatoAnnuale",
        { token },
      );
      setTopClienti(perFatturato.content);

      // Ultimi clienti inseriti
      const perData = await chiamataApi(
        "/clienti?page=0&size=5&sortBy=dataInserimento",
        { token },
      );
      setUltimiClienti(perData.content);

      // Prendo tutti gli stati e per ognuno conto quante fatture ha
      const stati = await chiamataApi("/stati-fattura?page=0&size=50", {
        token,
      });
      setTotaleStati(stati.totalElements);

      const conteggi = [];
      for (let i = 0; i < stati.content.length; i++) {
        const s = stati.content[i];
        const risultato = await chiamataApi(
          "/fatture?page=0&size=1&stato=" + s.nome,
          { token },
        );
        conteggi.push({ nome: s.nome, quante: risultato.totalElements });
      }
      setConteggioStati(conteggi);
    } catch (err) {
      setErrore(
        "Impossibile caricare i dati. Controlla di aver effettuato il login.",
      );
    } finally {
      setCaricamento(false);
    }
  }

  useEffect(() => {
    caricaDati();
  }, []);

  function coloreStato(nomeStato) {
    if (nomeStato === "PAGATA") return "success";
    if (nomeStato === "NON PAGATA" || nomeStato === "SCADUTA") return "danger";
    if (nomeStato === "EMESSA") return "primary";
    return "warning";
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-1">Dashboard</h2>
      <p className="text-muted mb-4">
        {utente && utente.email
          ? "Bentornata! Sei connessa come " + utente.email
          : "Riepilogo della piattaforma"}
      </p>

      {caricamento && <Spinner animation="border" />}
      {errore && <Alert variant="danger">{errore}</Alert>}

      {!caricamento && !errore && (
        <>
          <Row xs={1} md={2} lg={4} className="g-4 mb-4">
            <Col>
              <Card
                as={Link}
                to="/clienti"
                className="h-100 text-decoration-none"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="text-muted">Clienti</span>
                    <FaUsers size={22} className="text-primary" />
                  </div>
                  <div className="fs-1 fw-bold">{totaleClienti}</div>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card
                as={Link}
                to="/fatture"
                className="h-100 text-decoration-none"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="text-muted">Fatture</span>
                    <FaFileInvoice size={22} className="text-success" />
                  </div>
                  <div className="fs-1 fw-bold">{totaleFatture}</div>
                  <div className="small text-muted">
                    {fattureAnno} nel {annoCorrente}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card
                as={Link}
                to="/utenti"
                className="h-100 text-decoration-none"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="text-muted">Utenti</span>
                    <FaUserShield size={22} className="text-danger" />
                  </div>
                  <div className="fs-1 fw-bold">{totaleUtenti}</div>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card
                as={Link}
                to="/stati-fattura"
                className="h-100 text-decoration-none"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="text-muted">Stati fattura</span>
                    <FaTags size={22} className="text-warning" />
                  </div>
                  <div className="fs-1 fw-bold">{totaleStati}</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Fatture divise per stato */}
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">Fatture per stato</h5>
              <div className="d-flex flex-wrap gap-3">
                {conteggioStati.map((s) => (
                  <div
                    key={s.nome}
                    className="d-flex align-items-center gap-2 border rounded px-3 py-2"
                  >
                    <Badge bg={coloreStato(s.nome)} className="rounded-pill">
                      {s.nome}
                    </Badge>
                    <span className="fs-5 fw-bold">{s.quante}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Row xs={1} lg={2} className="g-4 mb-4">
            <Col>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Ultime fatture</h5>
                    <Link to="/fatture" className="small">
                      Vedi tutte
                    </Link>
                  </div>

                  {ultimeFatture.length === 0 ? (
                    <p className="text-muted mb-0">Nessuna fattura presente.</p>
                  ) : (
                    <Table hover responsive className="align-middle mb-0">
                      <tbody>
                        {ultimeFatture.map((fattura) => (
                          <tr key={fattura.id}>
                            <td className="fw-semibold">{fattura.numero}</td>
                            <td className="text-muted small">
                              {fattura.cliente.ragioneSociale}
                            </td>
                            <td>€ {fattura.importo}</td>
                            <td>
                              <Badge
                                bg={coloreStato(fattura.statoFattura.nome)}
                                className="rounded-pill"
                              >
                                {fattura.statoFattura.nome}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Clienti per fatturato</h5>
                    <Link to="/clienti" className="small">
                      Vedi tutti
                    </Link>
                  </div>

                  {topClienti.length === 0 ? (
                    <p className="text-muted mb-0">Nessun cliente presente.</p>
                  ) : (
                    <Table hover responsive className="align-middle mb-0">
                      <tbody>
                        {topClienti.map((cliente) => (
                          <tr key={cliente.id}>
                            <td className="fw-semibold">
                              {cliente.ragioneSociale}
                            </td>
                            <td className="text-muted small">
                              {cliente.tipoCliente}
                            </td>
                            <td>€ {cliente.fatturatoAnnuale}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Ultimi clienti inseriti */}
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Ultimi clienti inseriti</h5>
                <Link to="/clienti" className="small">
                  Vedi tutti
                </Link>
              </div>

              {ultimiClienti.length === 0 ? (
                <p className="text-muted mb-0">Nessun cliente presente.</p>
              ) : (
                <Table hover responsive className="align-middle mb-0">
                  <tbody>
                    {ultimiClienti.map((cliente) => (
                      <tr key={cliente.id}>
                        <td className="fw-semibold">
                          {cliente.ragioneSociale}
                        </td>
                        <td className="text-muted small">{cliente.email}</td>
                        <td className="text-muted small">
                          {cliente.dataInserimento}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}

export default DashboardPage;

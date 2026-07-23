import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Row, Col } from "react-bootstrap";
import { chiamataApi } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

// Se ricevo "cliente" sto modificando, altrimenti sto creando.
function ClienteModal({ cliente, onSalvato }) {
  const { token } = useAuth();

  const [aperto, setAperto] = useState(false);
  const [errore, setErrore] = useState(null);
  const [salvataggio, setSalvataggio] = useState(false);

  // Elenco di tutti i comuni, caricato una volta sola
  const [comuni, setComuni] = useState([]);
  const [caricamentoComuni, setCaricamentoComuni] = useState(false);

  // Dati anagrafici del cliente
  const [ragioneSociale, setRagioneSociale] = useState("");
  const [partitaIva, setPartitaIva] = useState("");
  const [tipoCliente, setTipoCliente] = useState("SRL");
  const [email, setEmail] = useState("");
  const [pec, setPec] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fatturatoAnnuale, setFatturatoAnnuale] = useState("");
  const [nomeContatto, setNomeContatto] = useState("");
  const [cognomeContatto, setCognomeContatto] = useState("");
  const [emailContatto, setEmailContatto] = useState("");
  const [telefonoContatto, setTelefonoContatto] = useState("");

  // Sede legale
  const [legProvincia, setLegProvincia] = useState("");
  const [legComuneId, setLegComuneId] = useState("");
  const [legVia, setLegVia] = useState("");
  const [legCivico, setLegCivico] = useState("");
  const [legLocalita, setLegLocalita] = useState("");
  const [legCap, setLegCap] = useState("");

  // Sede operativa
  const [opProvincia, setOpProvincia] = useState("");
  const [opComuneId, setOpComuneId] = useState("");
  const [opVia, setOpVia] = useState("");
  const [opCivico, setOpCivico] = useState("");
  const [opLocalita, setOpLocalita] = useState("");
  const [opCap, setOpCap] = useState("");

  // Quando apro la finestra preparo tutto
  useEffect(() => {
    if (!aperto) return;

    setErrore(null);

    if (cliente) {
      // Modifica: precompilo i dati anagrafici
      setRagioneSociale(cliente.ragioneSociale);
      setPartitaIva(cliente.partitaIva);
      setTipoCliente(cliente.tipoCliente);
      setEmail(cliente.email);
      setPec(cliente.pec);
      setTelefono(cliente.telefono);
      setFatturatoAnnuale(cliente.fatturatoAnnuale);
      setNomeContatto(cliente.nomeContatto);
      setCognomeContatto(cliente.cognomeContatto);
      setEmailContatto(cliente.emailContatto);
      setTelefonoContatto(cliente.telefonoContatto);
    } else {
      // Creazione: campi vuoti e carico i comuni per le tendine
      setRagioneSociale("");
      setPartitaIva("");
      setTipoCliente("SRL");
      setEmail("");
      setPec("");
      setTelefono("");
      setFatturatoAnnuale("");
      setNomeContatto("");
      setCognomeContatto("");
      setEmailContatto("");
      setTelefonoContatto("");
      setLegProvincia("");
      setLegComuneId("");
      setLegVia("");
      setLegCivico("");
      setLegLocalita("");
      setLegCap("");
      setOpProvincia("");
      setOpComuneId("");
      setOpVia("");
      setOpCivico("");
      setOpLocalita("");
      setOpCap("");
      caricaComuni();
    }
  }, [aperto]);

  // Carico tutti i comuni in una volta sola
  async function caricaComuni() {
    if (comuni.length > 0) return;
    try {
      setCaricamentoComuni(true);
      const dati = await chiamataApi("/comuni?page=0&size=8000", { token });
      setComuni(dati.content);
    } catch (err) {
      setErrore("Impossibile caricare i comuni.");
    } finally {
      setCaricamentoComuni(false);
    }
  }

  // Ricavo l'elenco delle province dai comuni, senza ripetizioni
  function elencoProvince() {
    const viste = [];
    const risultato = [];
    for (let i = 0; i < comuni.length; i++) {
      const prov = comuni[i].provincia;
      if (!viste.includes(prov.id)) {
        viste.push(prov.id);
        risultato.push(prov);
      }
    }
    // Ordino per nome
    risultato.sort((a, b) => a.nome.localeCompare(b.nome));
    return risultato;
  }

  // Filtro i comuni della provincia scelta
  function comuniDellaProvincia(provinciaId) {
    if (!provinciaId) return [];
    const risultato = [];
    for (let i = 0; i < comuni.length; i++) {
      if (comuni[i].provincia.id === provinciaId) {
        risultato.push(comuni[i]);
      }
    }
    risultato.sort((a, b) => a.nome.localeCompare(b.nome));
    return risultato;
  }

  // Crea un indirizzo e restituisce il suo id
  async function creaIndirizzo(via, civico, localita, cap, comuneId) {
    const creato = await chiamataApi("/indirizzi", {
      metodo: "POST",
      body: {
        via: via,
        civico: civico,
        localita: localita,
        cap: cap,
        comuneId: comuneId,
      },
      token: token,
    });
    return creato.id;
  }

  async function salva() {
    try {
      setErrore(null);
      setSalvataggio(true);

      let sedeLegaleId;
      let sedeOperativaId;

      if (cliente) {
        // In modifica riuso gli indirizzi esistenti
        sedeLegaleId = cliente.sedeLegale.id;
        sedeOperativaId = cliente.sedeOperativa.id;
      } else {
        // In creazione creo prima i due indirizzi
        sedeLegaleId = await creaIndirizzo(
          legVia,
          legCivico,
          legLocalita,
          legCap,
          legComuneId,
        );
        sedeOperativaId = await creaIndirizzo(
          opVia,
          opCivico,
          opLocalita,
          opCap,
          opComuneId,
        );
      }

      const corpo = {
        ragioneSociale: ragioneSociale,
        partitaIva: partitaIva,
        tipoCliente: tipoCliente,
        email: email,
        pec: pec,
        telefono: telefono,
        fatturatoAnnuale: Number(fatturatoAnnuale),
        nomeContatto: nomeContatto,
        cognomeContatto: cognomeContatto,
        emailContatto: emailContatto,
        telefonoContatto: telefonoContatto,
        sedeLegaleId: sedeLegaleId,
        sedeOperativaId: sedeOperativaId,
      };

      if (cliente) {
        await chiamataApi("/clienti/" + cliente.id, {
          metodo: "PUT",
          body: corpo,
          token: token,
        });
      } else {
        await chiamataApi("/clienti", {
          metodo: "POST",
          body: corpo,
          token: token,
        });
      }

      setAperto(false);
      onSalvato();
    } catch (err) {
      setErrore("Impossibile salvare il cliente. Controlla i dati inseriti.");
    } finally {
      setSalvataggio(false);
    }
  }

  // Controllo che i campi obbligatori siano compilati
  const anagraficaOk =
    ragioneSociale &&
    partitaIva &&
    email &&
    pec &&
    telefono &&
    fatturatoAnnuale &&
    nomeContatto &&
    cognomeContatto &&
    emailContatto &&
    telefonoContatto;

  const indirizziOk =
    legComuneId &&
    legVia &&
    legCivico &&
    legLocalita &&
    legCap &&
    opComuneId &&
    opVia &&
    opCivico &&
    opLocalita &&
    opCap;

  // In modifica non chiedo gli indirizzi
  const formValido = cliente ? anagraficaOk : anagraficaOk && indirizziOk;

  return (
    <>
      {cliente ? (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setAperto(true)}
        >
          Modifica
        </Button>
      ) : (
        <Button variant="success" onClick={() => setAperto(true)}>
          Nuovo cliente
        </Button>
      )}

      <Modal show={aperto} onHide={() => setAperto(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {cliente ? "Modifica cliente" : "Nuovo cliente"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errore && <Alert variant="danger">{errore}</Alert>}

          <h6 className="mb-3">Dati aziendali</h6>
          <Row className="g-3 mb-4">
            <Col md={8}>
              <Form.Label>Ragione sociale</Form.Label>
              <Form.Control
                type="text"
                value={ragioneSociale}
                onChange={(e) => setRagioneSociale(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Label>Tipo cliente</Form.Label>
              <Form.Select
                value={tipoCliente}
                onChange={(e) => setTipoCliente(e.target.value)}
              >
                <option value="PA">PA</option>
                <option value="SAS">SAS</option>
                <option value="SPA">SPA</option>
                <option value="SRL">SRL</option>
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Partita IVA</Form.Label>
              <Form.Control
                type="text"
                value={partitaIva}
                onChange={(e) => setPartitaIva(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Fatturato annuale</Form.Label>
              <Form.Control
                type="number"
                value={fatturatoAnnuale}
                onChange={(e) => setFatturatoAnnuale(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label>PEC</Form.Label>
              <Form.Control
                type="email"
                value={pec}
                onChange={(e) => setPec(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Telefono</Form.Label>
              <Form.Control
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </Col>
          </Row>

          <h6 className="mb-3">Contatto di riferimento</h6>
          <Row className="g-3 mb-4">
            <Col md={6}>
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                value={nomeContatto}
                onChange={(e) => setNomeContatto(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Cognome</Form.Label>
              <Form.Control
                type="text"
                value={cognomeContatto}
                onChange={(e) => setCognomeContatto(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Email contatto</Form.Label>
              <Form.Control
                type="email"
                value={emailContatto}
                onChange={(e) => setEmailContatto(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Telefono contatto</Form.Label>
              <Form.Control
                type="text"
                value={telefonoContatto}
                onChange={(e) => setTelefonoContatto(e.target.value)}
              />
            </Col>
          </Row>

          {/* Gli indirizzi si inseriscono solo alla creazione */}
          {!cliente && (
            <>
              {caricamentoComuni && (
                <Alert variant="info">Caricamento comuni in corso...</Alert>
              )}

              <h6 className="mb-3">Sede legale</h6>
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <Form.Label>Provincia</Form.Label>
                  <Form.Select
                    value={legProvincia}
                    onChange={(e) => {
                      setLegProvincia(e.target.value);
                      setLegComuneId(""); // azzero il comune se cambio provincia
                    }}
                  >
                    <option value="">Seleziona...</option>
                    {elencoProvince().map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} ({p.sigla})
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>Comune</Form.Label>
                  <Form.Select
                    value={legComuneId}
                    onChange={(e) => setLegComuneId(e.target.value)}
                    disabled={!legProvincia}
                  >
                    <option value="">Seleziona...</option>
                    {comuniDellaProvincia(legProvincia).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>Via</Form.Label>
                  <Form.Control
                    type="text"
                    value={legVia}
                    onChange={(e) => setLegVia(e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Form.Label>Civico</Form.Label>
                  <Form.Control
                    type="text"
                    value={legCivico}
                    onChange={(e) => setLegCivico(e.target.value)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Label>CAP</Form.Label>
                  <Form.Control
                    type="text"
                    value={legCap}
                    onChange={(e) => setLegCap(e.target.value)}
                  />
                </Col>
                <Col md={12}>
                  <Form.Label>Località</Form.Label>
                  <Form.Control
                    type="text"
                    value={legLocalita}
                    onChange={(e) => setLegLocalita(e.target.value)}
                  />
                </Col>
              </Row>

              <h6 className="mb-3">Sede operativa</h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Provincia</Form.Label>
                  <Form.Select
                    value={opProvincia}
                    onChange={(e) => {
                      setOpProvincia(e.target.value);
                      setOpComuneId("");
                    }}
                  >
                    <option value="">Seleziona...</option>
                    {elencoProvince().map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} ({p.sigla})
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>Comune</Form.Label>
                  <Form.Select
                    value={opComuneId}
                    onChange={(e) => setOpComuneId(e.target.value)}
                    disabled={!opProvincia}
                  >
                    <option value="">Seleziona...</option>
                    {comuniDellaProvincia(opProvincia).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>Via</Form.Label>
                  <Form.Control
                    type="text"
                    value={opVia}
                    onChange={(e) => setOpVia(e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Form.Label>Civico</Form.Label>
                  <Form.Control
                    type="text"
                    value={opCivico}
                    onChange={(e) => setOpCivico(e.target.value)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Label>CAP</Form.Label>
                  <Form.Control
                    type="text"
                    value={opCap}
                    onChange={(e) => setOpCap(e.target.value)}
                  />
                </Col>
                <Col md={12}>
                  <Form.Label>Località</Form.Label>
                  <Form.Control
                    type="text"
                    value={opLocalita}
                    onChange={(e) => setOpLocalita(e.target.value)}
                  />
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAperto(false)}>
            Annulla
          </Button>
          <Button
            variant="primary"
            onClick={salva}
            disabled={!formValido || salvataggio}
          >
            {salvataggio ? "Salvataggio..." : "Salva"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ClienteModal;

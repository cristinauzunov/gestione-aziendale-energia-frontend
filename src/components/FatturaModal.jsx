import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { chiamataApi } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { FaEdit, FaPlus } from "react-icons/fa";

// Se ricevo "fattura" sto modificando, altrimenti sto creando.
// "onSalvato" e' la funzione da chiamare dopo il salvataggio per ricaricare la lista.
function FatturaModal({ fattura, onSalvato }) {
  const { token } = useAuth();

  const [aperto, setAperto] = useState(false);
  const [errore, setErrore] = useState(null);

  // Elenchi per le tendine
  const [clienti, setClienti] = useState([]);
  const [stati, setStati] = useState([]);

  // Campi del form
  const [data, setData] = useState("");
  const [numero, setNumero] = useState("");
  const [importo, setImporto] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [statoFatturaId, setStatoFatturaId] = useState("");

  // Quando apro la finestra carico le tendine e precompilo i campi
  useEffect(() => {
    if (!aperto) return;

    caricaElenchi();

    if (fattura) {
      // Modifica: precompilo con i dati esistenti
      setData(fattura.data);
      setNumero(fattura.numero);
      setImporto(fattura.importo);
      setClienteId(fattura.cliente.id);
      setStatoFatturaId(fattura.statoFattura.id);
    } else {
      // Creazione: campi vuoti
      setData("");
      setNumero("");
      setImporto("");
      setClienteId("");
      setStatoFatturaId("");
    }
    setErrore(null);
  }, [aperto]);

  async function caricaElenchi() {
    try {
      const datiClienti = await chiamataApi("/clienti?page=0&size=100", {
        token,
      });
      setClienti(datiClienti.content);
      const datiStati = await chiamataApi("/stati-fattura?page=0&size=50", {
        token,
      });
      setStati(datiStati.content);
    } catch (err) {
      setErrore("Impossibile caricare clienti e stati.");
    }
  }

  async function salva() {
    try {
      setErrore(null);

      const corpo = {
        data: data,
        numero: Number(numero),
        importo: Number(importo),
        clienteId: clienteId,
        statoFatturaId: statoFatturaId,
      };

      if (fattura) {
        await chiamataApi("/fatture/" + fattura.id, {
          metodo: "PUT",
          body: corpo,
          token: token,
        });
      } else {
        await chiamataApi("/fatture", {
          metodo: "POST",
          body: corpo,
          token: token,
        });
      }

      setAperto(false);
      onSalvato();
    } catch (err) {
      setErrore("Impossibile salvare la fattura. Controlla i dati inseriti.");
    }
  }

  // Il pulsante di salvataggio si attiva solo se ho compilato tutto
  const formValido = data && numero && importo && clienteId && statoFatturaId;

  return (
    <>
      {fattura ? (
        <Button
          variant="outline-primary"
          size="sm"
          title="Modifica"
          onClick={() => setAperto(true)}
        >
          <FaEdit />
        </Button>
      ) : (
        <Button variant="success" onClick={() => setAperto(true)}>
          <FaPlus className="me-2" />
          Nuova fattura
        </Button>
      )}

      <Modal show={aperto} onHide={() => setAperto(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {fattura ? "Modifica fattura" : "Nuova fattura"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errore && <Alert variant="danger">{errore}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Data</Form.Label>
            <Form.Control
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Numero</Form.Label>
            <Form.Control
              type="number"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Importo</Form.Label>
            <Form.Control
              type="number"
              value={importo}
              onChange={(e) => setImporto(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Cliente</Form.Label>
            <Form.Select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            >
              <option value="">Seleziona un cliente...</option>
              {clienti.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.ragioneSociale}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Stato</Form.Label>
            <Form.Select
              value={statoFatturaId}
              onChange={(e) => setStatoFatturaId(e.target.value)}
            >
              <option value="">Seleziona uno stato...</option>
              {stati.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAperto(false)}>
            Annulla
          </Button>
          <Button variant="primary" onClick={salva} disabled={!formValido}>
            Salva
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default FatturaModal;

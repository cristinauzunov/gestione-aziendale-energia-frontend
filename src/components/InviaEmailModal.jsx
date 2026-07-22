import { useState } from "react";
import { Modal, Button, Form, Alert} from "react-bootstrap";
import { chiamataApi} from "../api/api.js";

// ricevo l'id del cliente a cui inviare la mal 
function InviaEmailModal ({ clienteid}) {
    //controllo se la finestra modale e aperta
    const [aperto, setAperto] =useState (false);
    //i due campi dell'email
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    //messaggi di esito
    const [esito, setEsito] = useState (null);


    //invia l'email chiamando il backend
    async function inviaEmail() {
    try {
      setEsito(null);
      await chiamataApi("/clienti/" + clienteId + "/send-email", {
        metodo: "POST",
        body: { subject: subject, body: body },
      });
      setEsito({ tipo: "success", testo: "Email inviata con successo!" });
      // Svuoto i campi dopo l'invio
      setSubject("");
      setBody("");
    } catch (err) {
      setEsito({ tipo: "danger", testo: "Errore nell'invio dell'email." });
    }
  }

  return (
    <>
      {/* Pulsante che apre la finestra */}
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => setAperto(true)}
      >
        Invia email
      </Button>

      {/* La finestra modale con il form */}
      <Modal show={aperto} onHide={() => setAperto(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Invia email al contatto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {esito && <Alert variant={esito.tipo}>{esito.testo}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Oggetto</Form.Label>
            <Form.Control
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Testo</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAperto(false)}>
            Chiudi
          </Button>
          <Button
            variant="primary"
            onClick={inviaEmail}
            disabled={!subject || !body}
          >
            Invia
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default InviaEmailModal
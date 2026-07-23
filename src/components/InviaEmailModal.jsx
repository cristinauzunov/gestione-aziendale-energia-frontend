import { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { chiamataApi } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function InviaEmailModal({ clienteId }) {
  const { token } = useAuth();

  const [aperto, setAperto] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [esito, setEsito] = useState(null);

  async function inviaEmail() {
    try {
      setEsito(null);
      await chiamataApi("/clienti/" + clienteId + "/send-email", {
        metodo: "POST",
        body: { subject: subject, body: body },
        token: token,
      });
      setEsito({ tipo: "success", testo: "Email inviata con successo!" });
      setSubject("");
      setBody("");
    } catch (err) {
      setEsito({ tipo: "danger", testo: "Errore nell'invio dell'email." });
    }
  }

  return (
    <>
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => setAperto(true)}
      >
        Invia email
      </Button>

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

export default InviaEmailModal;

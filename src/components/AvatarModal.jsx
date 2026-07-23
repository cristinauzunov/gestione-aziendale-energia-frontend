import { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { inviaFile } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function AvatarModal({ utente, onSalvato }) {
  const { token } = useAuth();

  const [aperto, setAperto] = useState(false);
  const [file, setFile] = useState(null);
  const [esito, setEsito] = useState(null);
  const [caricamento, setCaricamento] = useState(false);

  async function carica() {
    try {
      setEsito(null);
      setCaricamento(true);

      // "avatar" e' il nome del parametro che si aspetta il backend
      await inviaFile(
        "/utenti/" + utente.id + "/avatar",
        "avatar",
        file,
        token,
      );

      setEsito({ tipo: "success", testo: "Avatar aggiornato!" });
      setFile(null);
      onSalvato();
    } catch (err) {
      setEsito({ tipo: "danger", testo: "Impossibile caricare l'immagine." });
    } finally {
      setCaricamento(false);
    }
  }

  return (
    <>
      <Button variant="outline-info" size="sm" onClick={() => setAperto(true)}>
        Avatar
      </Button>

      <Modal show={aperto} onHide={() => setAperto(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cambia avatar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {esito && <Alert variant={esito.tipo}>{esito.testo}</Alert>}

          <div className="text-center mb-3">
            <img
              src={utente.avatar}
              alt={utente.username}
              className="rounded-circle"
              style={{ width: "100px", height: "100px" }}
            />
          </div>

          <Form.Group>
            <Form.Label>Scegli una nuova immagine</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAperto(false)}>
            Chiudi
          </Button>
          <Button
            variant="primary"
            onClick={carica}
            disabled={!file || caricamento}
          >
            {caricamento ? "Caricamento..." : "Carica"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AvatarModal;

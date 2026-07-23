import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Row, Col } from "react-bootstrap";
import { chiamataApi } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

// Se ricevo "utente" sto modificando, altrimenti sto creando.
function UtenteModal({ utente, onSalvato }) {
  const { token } = useAuth();

  const [aperto, setAperto] = useState(false);
  const [errore, setErrore] = useState(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");

  useEffect(() => {
    if (!aperto) return;

    setErrore(null);
    // La password non arriva mai dal backend, quindi la lascio sempre vuota
    setPassword("");

    if (utente) {
      setUsername(utente.username);
      setEmail(utente.email);
      setNome(utente.nome);
      setCognome(utente.cognome);
    } else {
      setUsername("");
      setEmail("");
      setNome("");
      setCognome("");
    }
  }, [aperto]);

  async function salva() {
    try {
      setErrore(null);

      const corpo = {
        username: username,
        email: email,
        password: password,
        nome: nome,
        cognome: cognome,
      };

      if (utente) {
        await chiamataApi("/utenti/" + utente.id, {
          metodo: "PUT",
          body: corpo,
          token: token,
        });
      } else {
        await chiamataApi("/utenti", {
          metodo: "POST",
          body: corpo,
          token: token,
        });
      }

      setAperto(false);
      onSalvato();
    } catch (err) {
      setErrore("Impossibile salvare l'utente. Controlla i dati inseriti.");
    }
  }

  // Controlli sulle lunghezze richieste dal backend
  const formValido =
    username.length >= 3 &&
    username.length <= 20 &&
    email &&
    password.length >= 6 &&
    nome.length >= 2 &&
    nome.length <= 30 &&
    cognome.length >= 2 &&
    cognome.length <= 30;

  return (
    <>
      {utente ? (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setAperto(true)}
        >
          Modifica
        </Button>
      ) : (
        <Button variant="success" onClick={() => setAperto(true)}>
          Nuovo utente
        </Button>
      )}

      <Modal show={aperto} onHide={() => setAperto(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {utente ? "Modifica utente" : "Nuovo utente"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errore && <Alert variant="danger">{errore}</Alert>}

          {utente && (
            <Alert variant="info">
              Per salvare le modifiche devi reinserire la password.
            </Alert>
          )}

          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Cognome</Form.Label>
              <Form.Control
                type="text"
                value={cognome}
                onChange={(e) => setCognome(e.target.value)}
              />
            </Col>
            <Col md={12}>
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Col>
            <Col md={12}>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Col>
            <Col md={12}>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Almeno 6 caratteri"
              />
            </Col>
          </Row>
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

export default UtenteModal;

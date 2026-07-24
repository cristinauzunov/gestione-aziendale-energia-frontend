import { useState } from "react";
import { Form, Button, Alert, Card, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaBolt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { chiamataApi } from "../api/api.js";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState(null);
  const [caricamento, setCaricamento] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function eseguiLogin() {
    try {
      setCaricamento(true);
      setErrore(null);

      const dati = await chiamataApi("/auth/login", {
        metodo: "POST",
        body: { email: email, password: password },
      });

      login(dati.token, { email: email });
      navigate("/dashboard");
    } catch (err) {
      setErrore("Email o password non corretti.");
    } finally {
      setCaricamento(false);
    }
  }

  // Permetto di accedere premendo Invio
  function premiInvio(e) {
    if (e.key === "Enter" && email && password) {
      eseguiLogin();
    }
  }

  return (
    <div className="pagina-login">
      <Card className="scheda-login">
        <Card.Body className="p-4 p-md-5">
          {/* Logo e titolo */}
          <div className="text-center mb-4">
            <div className="cerchio-logo mx-auto mb-3">
              <FaBolt size={28} />
            </div>
            <h3 className="fw-bold mb-1">Energy Services</h3>
            <p className="text-muted mb-0">Gestione clienti e fatturazione</p>
          </div>

          {errore && <Alert variant="danger">{errore}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <FaEnvelope />
              </InputGroup.Text>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={premiInvio}
                placeholder="nome@azienda.it"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <FaLock />
              </InputGroup.Text>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={premiInvio}
                placeholder="La tua password"
              />
            </InputGroup>
          </Form.Group>

          <Button
            variant="primary"
            className="w-100 py-2"
            onClick={eseguiLogin}
            disabled={!email || !password || caricamento}
          >
            {caricamento ? "Accesso in corso..." : "Accedi"}
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}

export default LoginPage;

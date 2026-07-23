import { useState } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { chiamataApi } from "../api/api.js";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState(null);
  const [caricamento, setCaricamento] = useState(false);

  // Prendo la funzione login dal context
  const { login } = useAuth();
  // Serve per spostarmi su un'altra pagina dopo il login
  const navigate = useNavigate();

  async function eseguiLogin() {
    try {
      setCaricamento(true);
      setErrore(null);

      // Chiamo il backend con email e password
      const dati = await chiamataApi("/auth/login", {
        metodo: "POST",
        body: { email: email, password: password },
      });

      // Il backend mi restituisce solo il token
      login(dati.token, null);

      // Dopo il login vado alla pagina clienti
      navigate("/clienti");
    } catch (err) {
      setErrore("Email o password non corretti.");
    } finally {
      setCaricamento(false);
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="mb-4 text-center">Accedi</h2>

          {errore && <Alert variant="danger">{errore}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Button
            variant="primary"
            className="w-100"
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
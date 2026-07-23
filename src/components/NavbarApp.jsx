import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function NavbarApp() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  // Mi serve per sapere in che pagina mi trovo
  const location = useLocation();

  function esci() {
    logout();
    navigate("/login");
  }

  // Nella pagina di login non mostro niente
  if (location.pathname === "/login") {
    return null;
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/clienti">
          Energy Services
        </Navbar.Brand>

        <Nav className="me-auto">
          <Nav.Link as={Link} to="/clienti">
            Clienti
          </Nav.Link>
          <Nav.Link as={Link} to="/fatture">
            Fatture
          </Nav.Link>
          <Nav.Link as={Link} to="/utenti">
            Utenti
          </Nav.Link>
          <Nav.Link as={Link} to="/stati-fattura">
            Stati fattura
          </Nav.Link>
        </Nav>

        <Button variant="outline-light" size="sm" onClick={esci}>
          Esci
        </Button>
      </Container>
    </Navbar>
  );
}

export default NavbarApp;

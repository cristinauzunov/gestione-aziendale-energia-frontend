import { Navbar, Nav, Container, Button, NavDropdown } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function NavbarApp() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
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
    <Navbar variant="dark" expand="lg" className="navbar-epic">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">
          Energy Services
        </Navbar.Brand>

        <Nav className="me-auto">
          <Nav.Link as={Link} to="/dashboard">
            Dashboard
          </Nav.Link>

          {/* Le sezioni di gestione raccolte in una tendina */}
          <NavDropdown title="Gestione" id="menu-gestione">
            <NavDropdown.Item as={Link} to="/clienti">
              Clienti
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/fatture">
              Fatture
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item as={Link} to="/utenti">
              Utenti
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/stati-fattura">
              Stati fattura
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>

        <Button variant="outline-light" size="sm" onClick={esci}>
          Esci
        </Button>
      </Container>
    </Navbar>
  );
}

export default NavbarApp;

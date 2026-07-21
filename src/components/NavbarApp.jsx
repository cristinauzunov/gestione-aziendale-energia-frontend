import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

function NavbarApp() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/clienti">
          Energy Services
        </Navbar.Brand>
        <Nav>
          {/* Uso "as={Link}" per far navigare react-router senza ricaricare la pagina */}
          <Nav.Link as={Link} to="/clienti">
            Clienti
          </Nav.Link>
          <Nav.Link as={Link} to="/fatture">
            Fatture
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavbarApp;
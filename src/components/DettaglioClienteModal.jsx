import { useState } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { FaEye } from "react-icons/fa";

// Riceve l'intero oggetto cliente
function DettaglioClienteModal({ cliente, comeLink }) {
  const [aperto, setAperto] = useState(false);

  function scriviIndirizzo(indirizzo) {
    if (!indirizzo) return "Non presente";
    return (
      indirizzo.via +
      " " +
      indirizzo.civico +
      ", " +
      indirizzo.cap +
      " " +
      indirizzo.localita +
      " (" +
      indirizzo.comune.provincia.sigla +
      ")"
    );
  }

  return (
    <>
      {comeLink ? (
        <span
          className="text-primary fw-semibold"
          style={{ cursor: "pointer" }}
          onClick={() => setAperto(true)}
        >
          {cliente.ragioneSociale}
        </span>
      ) : (
        <Button
          variant="outline-secondary"
          size="sm"
          title="Dettagli"
          onClick={() => setAperto(true)}
        >
          <FaEye />
        </Button>
      )}

      <Modal show={aperto} onHide={() => setAperto(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{cliente.ragioneSociale}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={6}>
              <strong>Partita IVA:</strong> {cliente.partitaIva}
            </Col>
            <Col md={6}>
              <strong>Tipo cliente:</strong> {cliente.tipoCliente}
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <strong>Email:</strong> {cliente.email}
            </Col>
            <Col md={6}>
              <strong>PEC:</strong> {cliente.pec}
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <strong>Telefono:</strong> {cliente.telefono}
            </Col>
            <Col md={6}>
              <strong>Fatturato annuale:</strong> € {cliente.fatturatoAnnuale}
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <strong>Data inserimento:</strong> {cliente.dataInserimento}
            </Col>
            <Col md={6}>
              <strong>Ultimo contatto:</strong>{" "}
              {cliente.dataUltimoContatto ? cliente.dataUltimoContatto : "Mai"}
            </Col>
          </Row>

          <hr />

          <h6>Contatto di riferimento</h6>
          <Row className="mb-3">
            <Col md={6}>
              <strong>Nome:</strong> {cliente.nomeContatto}{" "}
              {cliente.cognomeContatto}
            </Col>
            <Col md={6}>
              <strong>Telefono:</strong> {cliente.telefonoContatto}
            </Col>
            <Col md={12}>
              <strong>Email:</strong> {cliente.emailContatto}
            </Col>
          </Row>

          <hr />

          <h6>Indirizzi</h6>
          <div className="mb-2">
            <strong>Sede legale:</strong> {scriviIndirizzo(cliente.sedeLegale)}
          </div>
          <div>
            <strong>Sede operativa:</strong>{" "}
            {scriviIndirizzo(cliente.sedeOperativa)}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAperto(false)}>
            Chiudi
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DettaglioClienteModal;

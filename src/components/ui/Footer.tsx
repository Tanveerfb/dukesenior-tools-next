import Link from "next/link";
import { Container, Row, Col, Accordion, ListGroup, Button } from "react-bootstrap";
import { BsFillBootstrapFill } from "react-icons/bs";
import { FaDiscord } from "react-icons/fa";
import { RiReactjsFill } from "react-icons/ri";
// other icons intentionally omitted

export default function Footer() {
  return (
    <footer className="bg-white border-top">
      <Container fluid className="py-5">
        <Container>
          <Row className="align-items-start gy-4">
            <Col lg={4}>
              <h4 className="mb-2">The Lair of Evil</h4>
              <p className="text-muted mb-2">Tools, events and community resources for streamers and the Phasmo Tourney project.</p>
              <div className="d-flex gap-2 align-items-center">
                <Button href="https://ko-fi.com/dukesenior" target="_blank" rel="noopener noreferrer" variant="warning">Support on Ko‑Fi</Button>
                <div className="text-muted small">&copy; {new Date().getFullYear()} DukeSenior</div>
              </div>
            </Col>

            <Col lg={2} className="d-none d-lg-block">
              <h6 className="text-uppercase small text-muted mb-2">Developer</h6>
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 border-0 bg-transparent"><Link href="/style-check" className="text-decoration-none">Style check</Link></ListGroup.Item>
              </ListGroup>
            </Col>

            <Col lg={2} className="d-none d-lg-block">
              <h6 className="text-uppercase small text-muted mb-2">About</h6>
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 border-0 bg-transparent text-muted">Manage events and tournaments</ListGroup.Item>
                <ListGroup.Item className="px-0 border-0 bg-transparent text-muted">Collaborate with others</ListGroup.Item>
              </ListGroup>
            </Col>

            <Col lg={2} className="d-none d-lg-block">
              <h6 className="text-uppercase small text-muted mb-2">Tech</h6>
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 border-0 bg-transparent"><a className="text-warning fw-semibold" href="https://react.dev/" target="_blank" rel="noopener noreferrer"><RiReactjsFill />&nbsp;React</a></ListGroup.Item>
                <ListGroup.Item className="px-0 border-0 bg-transparent"><a className="text-warning fw-semibold" href="https://react-bootstrap.github.io/" target="_blank" rel="noopener noreferrer"><BsFillBootstrapFill />&nbsp;React-Bootstrap</a></ListGroup.Item>
              </ListGroup>
            </Col>

            <Col lg={2} className="d-none d-lg-block">
              <h6 className="text-uppercase small text-muted mb-2">Community</h6>
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 border-0 bg-transparent"><a href="https://discord.gg/xB9mpZfbq3" target="_blank" rel="noopener noreferrer" className="text-decoration-none">The Lair of Evil (Discord)</a></ListGroup.Item>
                <ListGroup.Item className="px-0 border-0 bg-transparent"><a href="https://discord.gg/r9WT8RUPxn" target="_blank" rel="noopener noreferrer" className="text-decoration-none">Phasmo Tourney (Discord)</a></ListGroup.Item>
                <ListGroup.Item className="px-0 border-0 bg-transparent"><span className="text-muted"><FaDiscord />&nbsp;dukesenior22</span></ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>

          {/* Collapsible for md and smaller */}
          <div className="d-lg-none mt-4">
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Developer</Accordion.Header>
                <Accordion.Body>
                  <Link href="/style-check">Style check</Link>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>About</Accordion.Header>
                <Accordion.Body>
                  <div>Manage events and tournaments</div>
                  <div>Collaborate with others</div>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>Tech</Accordion.Header>
                <Accordion.Body>
                  <div><a className="text-warning fw-semibold" href="https://react.dev/" target="_blank" rel="noopener noreferrer"><RiReactjsFill /> React</a></div>
                  <div><a className="text-warning fw-semibold" href="https://react-bootstrap.github.io/" target="_blank" rel="noopener noreferrer"><BsFillBootstrapFill /> React-Bootstrap</a></div>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="3">
                <Accordion.Header>Community</Accordion.Header>
                <Accordion.Body>
                  <div><a href="https://discord.gg/xB9mpZfbq3" target="_blank" rel="noopener noreferrer">The Lair of Evil (Discord)</a></div>
                  <div><a href="https://discord.gg/r9WT8RUPxn" target="_blank" rel="noopener noreferrer">Phasmo Tourney (Discord)</a></div>
                  <div className="d-flex align-items-center"><FaDiscord className="me-2" />dukesenior22</div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        </Container>

        <Container className="mt-4">
          <Row className="align-items-center">
            <Col md={6} className="text-muted small">Built with ❤️ — The Lair of Evil</Col>
            <Col md={6} className="text-md-end">
              <a href="https://twitter.com/dukesenior" target="_blank" className="me-3 text-muted" aria-label="Twitter">Twitter</a>
              <a href="https://www.instagram.com/dukesenior22" target="_blank" className="me-3 text-muted" aria-label="Instagram">Instagram</a>
              <a href="https://ko-fi.com/dukesenior" target="_blank" className="text-muted" aria-label="Ko-fi">Ko‑Fi</a>
            </Col>
          </Row>
        </Container>
      </Container>
    </footer>
  );
}

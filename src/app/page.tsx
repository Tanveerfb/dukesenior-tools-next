"use client";
import Link from "next/link";
import { Alert, Accordion, Button, ButtonGroup, Container, Tab, Tabs } from "react-bootstrap";

export default function HomePage() {
  return (
    <>
      <Container fluid className="p-3">
        <Container>
      <Tabs defaultActiveKey="current" className="mb-3" fill>
            <Tab eventKey="current" title="Current Events">
              <ButtonGroup className="flex-wrap flex-row p-2 align-items-center">
        <Button variant="primary" className="m-1"><Link className="text-light text-decoration-none" href="/tourney4">Phasmo Tourney 4</Link></Button>
        <Button variant="primary" className="m-1"><Link className="text-light text-decoration-none" href="/phasmoTourney3">Phasmo Tourney 3</Link></Button>
              </ButtonGroup>
            </Tab>
            <Tab eventKey="tools" title="Tools">
              <ButtonGroup className="flex-wrap flex-row p-2 align-items-center">
                <Button variant="primary" className="m-1"><Link className="text-light text-decoration-none" href="/todolist">To Do List</Link></Button>
                <Button variant="success" className="m-1"><Link className="text-light text-decoration-none" href="/GeminiAI">Gemini AI</Link></Button>
              </ButtonGroup>
            </Tab>
            <Tab eventKey="wiki" title="Wiki">
              <ButtonGroup className="flex-wrap flex-row p-2 align-items-center">
                <Button variant="primary" className="m-1"><Link className="text-light text-decoration-none" href="/genshin">Genshin Impact</Link></Button>
                <Button variant="tertiary" className="m-1"><Link className="text-light text-decoration-none" href="/phasmowiki">Phasmophobia</Link></Button>
              </ButtonGroup>
            </Tab>
            <Tab eventKey="contact" title="Feedback">
              <ButtonGroup className="d-flex flex-wrap flex-row p-1">
                <Button variant="info" className="m-1"><Link className="text-light text-decoration-none" href="/suggestionsform">Suggestions form</Link></Button>
              </ButtonGroup>
            </Tab>
          </Tabs>
        </Container>
      </Container>
      <Container fluid className="p-3">
        <Alert variant="info">Past Events</Alert>
        <Accordion defaultActiveKey="99" alwaysOpen>
          <Accordion.Item eventKey="1">
            <Accordion.Header>[Past] [Closed] Dukesenior's Phasmo Tourney #1</Accordion.Header>
            <Accordion.Body>
              <Button variant="dark" className="mx-1">
                <Link className="text-white text-decoration-none" href="/phasmotourneyData">Phasmo Tourney #1 Recorded runs</Link>
              </Button>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header>[Past] [Closed] Dukesenior's Phasmo Tourney #2</Accordion.Header>
            <Accordion.Body>
              <Button variant="dark" className="mx-1">
                <Link className="text-white text-decoration-none" href="/phasmotourney2records">Recorded runs</Link>
              </Button>
              <Button variant="dark" className="mx-1">
                <Link className="text-white text-decoration-none" href="/phasmotourney2standings">Standings</Link>
              </Button>
              <Button variant="dark" className="mx-1">
                <Link className="text-white text-decoration-none" href="/phasmotourney2bracket">Bracket</Link>
              </Button>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="3">
            <Accordion.Header>[Past] [Closed] Dukesenior's Phasmo Tourney #3</Accordion.Header>
            <Accordion.Body>
              <Button variant="dark" className="mx-1">
                <Link className="text-white text-decoration-none" href="/tourney3recordedruns">Recorded runs</Link>
              </Button>
              <Button variant="dark" className="mx-1">
                <Link className="text-white text-decoration-none" href="/tourney3standings">Standings</Link>
              </Button>
              <Button variant="dark" className="mx-1">
                <Link className="text-white text-decoration-none" href="/phasmoTourney3">Bracket</Link>
              </Button>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="4">
            <Accordion.Header>[Past] [Closed] Dukesenior's Phasmo Tourney #4</Accordion.Header>
            <Accordion.Body>
              <Button variant="dark" className="mx-1">
                <Link className="text-white text-decoration-none" href="/tourney4recordedruns">Recorded runs</Link>
              </Button>
              <Button variant="dark" className="mx-1">
                <Link className="text-white text-decoration-none" href="/tourney4standings">Standings</Link>
              </Button>
              <Button variant="dark" className="mx-1">
                <Link className="text-white text-decoration-none" href="/tourney4stats">Stats</Link>
              </Button>
              <Button variant="dark" className="mx-1">
                <Link className="text-white text-decoration-none" href="/tourney4">Bracket</Link>
              </Button>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Container>
    </>
  );
}

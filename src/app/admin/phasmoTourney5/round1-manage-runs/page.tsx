"use client";
import { Alert, Button, Card, Container, ListGroup } from "react-bootstrap";

export default function Round1ManageRunsPage() {
  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-3">Round 1 — Manage Runs (Admin)</h1>
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Host Selections
          </Card.Title>
          <Alert variant="info" className="mt-2">
            TODO: Configure map, settings, and score system for Round 1.
          </Alert>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Wildcard Choices
          </Card.Title>
          <Alert variant="secondary" className="mt-2">
            TODO: Define N wildcards (N = number of players). Lower prestige
            players can go first to pick a wildcard or skip to default
            randomness. Once a wildcard is selected, remove it from the list.
          </Alert>
          <Button variant="outline-primary" disabled>
            TODO: Start Wildcard Selection Order
          </Button>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Record Run Details
          </Card.Title>
          <Alert variant="warning" className="mt-2">
            TODO: Admin form for entering each player\'s run details (map,
            settings reference, per-score sheet totals, notes). Persist and
            compute standings.
          </Alert>
          <ListGroup className="mt-3">
            <ListGroup.Item className="text-muted">
              TODO: Runs list (player, score, time)
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Post-Round Actions
          </Card.Title>
          <Alert variant="light" className="mt-2">
            TODO: After results are confirmed, mark Top 2 as Immune; open
            Vote-Out session for remaining players; enable optional
            Comeback/Eliminator pairing setup.
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  );
}

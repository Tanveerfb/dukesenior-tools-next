"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Alert,
  Card,
  Form,
  Button,
  Row,
  Col,
} from "react-bootstrap";

interface Player {
  id: string;
  name: string;
  status: "Active" | "Inactive" | "Eliminated";
}

export default function ManageEliminatorPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [challenger, setChallenger] = useState<string>("");
  const [defender, setDefender] = useState<string>("");
  const [winner, setWinner] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/phasmoTourney5/players");
        const json = await res.json();
        setPlayers(
          Array.isArray(json)
            ? json.filter((p: any) => p.status !== "Eliminated")
            : []
        );
      } catch {}
    })();
  }, []);

  function submitEliminator(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Persist eliminator pairing and outcome
    alert("TODO: Save eliminator session (challenger, defender, winner)");
  }

  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-3">Manage Eliminator</h1>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Form onSubmit={submitEliminator}>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Challenger</Form.Label>
                  <Form.Select
                    value={challenger}
                    onChange={(e) => setChallenger(e.target.value)}
                    required
                  >
                    <option value="">Select player…</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Defender</Form.Label>
                  <Form.Select
                    value={defender}
                    onChange={(e) => setDefender(e.target.value)}
                    required
                  >
                    <option value="">Select player…</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Winner (manual)</Form.Label>
                  <Form.Select
                    value={winner}
                    onChange={(e) => setWinner(e.target.value)}
                    required
                  >
                    <option value="">Select winner…</option>
                    {[challenger, defender].filter(Boolean).map((pid) => {
                      const p = players.find((x) => x.id === pid);
                      return (
                        <option key={pid} value={pid}>
                          {p?.name || pid}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex gap-2">
              <Button type="submit" variant="primary">
                Save
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => {
                  setChallenger("");
                  setDefender("");
                  setWinner("");
                }}
              >
                Reset
              </Button>
            </div>
          </Form>
          <Alert variant="light" className="mt-3">
            TODO: Wire this to Round 1 flow. Loser is eliminated immediately.
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  );
}

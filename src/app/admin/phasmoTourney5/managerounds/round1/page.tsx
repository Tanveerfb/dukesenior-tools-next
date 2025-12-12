"use client";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Container,
  Form,
  Row,
  Col,
  Table,
} from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";

interface Player {
  id: string;
  name: string;
  status: "Active" | "Inactive" | "Eliminated";
}

export default function Round1ManageRunsPage() {
  const { user, admin } = useAuth();
  const officer = user?.displayName || user?.email || "Unknown";
  const [players, setPlayers] = useState<Player[]>([]);
  const [wildcards, setWildcards] = useState<string[]>([]);
  const [editingWildcards, setEditingWildcards] = useState<string>("");
  const [form, setForm] = useState({
    playerId: "",
    ghostPicture: false,
    bonePicture: false,
    cursedItemUse: false,
    objective1: false,
    objective2: false,
    objective3: false,
    perfectGame: false,
    survived: false,
    correctGhostType: false,
    notes: "",
  });

  useEffect(() => {
    // Load players
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
    // Load wildcards
    (async () => {
      try {
        const res = await fetch("/api/admin/phasmoTourney5/round1/wildcards");
        const json = await res.json();
        const list = Array.isArray(json) ? json : [];
        setWildcards(list);
        setEditingWildcards(list.join("\n"));
      } catch {}
    })();
  }, []);

  function resetForm() {
    setForm({
      playerId: "",
      ghostPicture: false,
      bonePicture: false,
      cursedItemUse: false,
      objective1: false,
      objective2: false,
      objective3: false,
      perfectGame: false,
      survived: false,
      correctGhostType: false,
      notes: "",
    });
  }

  async function submitRun(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Persist run details for Round 1 and compute standings
    alert("TODO: Submit Round 1 run details");
  }

  if (!admin) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Admin access required.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-3">Round 1 — Manage Runs (Admin)</h1>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Round 1 Environment
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
            Generated list below. You can edit the JSON later.
          </Alert>
          <Table responsive size="sm" className="mt-2">
            <thead>
              <tr>
                <th>#</th>
                <th>Wildcard</th>
              </tr>
            </thead>
            <tbody>
              {wildcards.map((w, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{w}</td>
                </tr>
              ))}
              {wildcards.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-muted">
                    No wildcards found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <Form
            className="mt-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const lines = editingWildcards
                .split(/\r?\n/)
                .map((s) => s.trim())
                .filter(Boolean);
              try {
                const res = await fetch(
                  "/api/admin/phasmoTourney5/round1/wildcards",
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(lines),
                  }
                );
                if (!res.ok) throw new Error(`Save failed: ${res.status}`);
                const saved = await res.json();
                setWildcards(saved);
              } catch (e: any) {
                alert(e?.message || "Failed to save wildcards");
              }
            }}
          >
            <Form.Label>Edit wildcards (one per line)</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={editingWildcards}
              onChange={(e) => setEditingWildcards(e.target.value)}
            />
            <div className="d-flex gap-2 mt-2">
              <Button type="submit" variant="primary">
                Save Wildcards
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => setEditingWildcards(wildcards.join("\n"))}
              >
                Reset
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Record Run Details
          </Card.Title>
          <Form onSubmit={submitRun} className="mt-3">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Officer</Form.Label>
                  <Form.Control value={officer} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Player</Form.Label>
                  <Form.Select
                    value={form.playerId}
                    onChange={(e) =>
                      setForm({ ...form, playerId: e.target.value })
                    }
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="g-3">
              <Col md={12}>
                <div className="d-flex flex-wrap gap-3">
                  {[
                    { key: "ghostPicture", label: "Ghost picture" },
                    { key: "bonePicture", label: "Bone picture" },
                    { key: "cursedItemUse", label: "Cursed item use" },
                    { key: "objective1", label: "Objective 1" },
                    { key: "objective2", label: "Objective 2" },
                    { key: "objective3", label: "Objective 3" },
                    { key: "perfectGame", label: "Perfect game" },
                    { key: "survived", label: "Survived" },
                    { key: "correctGhostType", label: "Correct ghost type" },
                  ].map((t) => (
                    <Form.Check
                      key={t.key}
                      type="switch"
                      id={`toggle-${t.key}`}
                      label={t.label}
                      checked={(form as any)[t.key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [t.key]: e.currentTarget.checked,
                        } as any)
                      }
                    />
                  ))}
                </div>
              </Col>
            </Row>
            <div className="d-flex gap-2 mt-3">
              <Button type="submit" variant="primary">
                Submit
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={resetForm}
              >
                Reset
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Alert variant="light" className="mt-2">
            Note: All recorded run details will appear on a public page
            "Recorded run details" with filters by round and player. TODO: Build
            that page.
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  );
}

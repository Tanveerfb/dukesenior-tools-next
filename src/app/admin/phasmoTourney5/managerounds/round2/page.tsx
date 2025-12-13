"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import GameSettingsAdminEditor from "../../../../../components/tourney/GameSettingsAdminEditor";

interface Player {
  id: string;
  name: string;
  status: "Active" | "Inactive" | "Eliminated";
}
interface Result {
  id: string;
  playerId: string;
  playerName: string;
  money: number;
  notes?: string;
  officer: string;
  createdAt: number;
}

export default function Round2ManageMoneyPage() {
  const { user, admin } = useAuth();
  const officer = user?.displayName || user?.email || "Unknown";
  const [players, setPlayers] = useState<Player[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [form, setForm] = useState<{
    playerId: string;
    money: string;
    notes: string;
  }>({ playerId: "", money: "", notes: "" });

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

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => b.money - a.money);
  }, [results]);

  function resetForm() {
    setForm({ playerId: "", money: "", notes: "" });
  }

  function submitResult(e: React.FormEvent) {
    e.preventDefault();
    const moneyNum = Number(form.money);
    if (!form.playerId || !isFinite(moneyNum)) return;
    const p = players.find((x) => x.id === form.playerId);
    const rec: Result = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      playerId: form.playerId,
      playerName: p?.name || form.playerId,
      money: moneyNum,
      notes: form.notes || undefined,
      officer,
      createdAt: Date.now(),
    };
    setResults((prev) => [rec, ...prev]);
    resetForm();
    // TODO: Persist this record (JSON/Firestore) and fetch to display.
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
      <h1 className="h4 fw-semibold mb-3">Round 2 — Money Round (Admin)</h1>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Round 2 Environment
          </Card.Title>
          <Alert variant="info" className="mt-2">
            TODO: Configure map and settings for Round 2. Goal: maximum money in
            15 minutes. No eliminations this round.
          </Alert>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Record Money Results
          </Card.Title>
          <Form onSubmit={submitResult} className="mt-3">
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
                  <Form.Label>Money earned</Form.Label>
                  <Form.Control
                    type="number"
                    step="1"
                    min="0"
                    inputMode="numeric"
                    value={form.money}
                    onChange={(e) =>
                      setForm({ ...form, money: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex gap-2 mt-2">
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
          <Card.Title as="h2" className="h5 fw-semibold">
            Results (descending)
          </Card.Title>
          <Table responsive size="sm" className="mt-2">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Money</th>
                <th>Officer</th>
                <th>Time</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{r.playerName}</td>
                  <td>${r.money.toLocaleString()}</td>
                  <td className="text-muted small">{r.officer}</td>
                  <td className="text-muted small">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="text-muted small">{r.notes || "-"}</td>
                </tr>
              ))}
              {sortedResults.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted">No results yet.</td>
                </tr>
              )}
            </tbody>
          </Table>
          <Alert variant="light" className="mt-2">
            TODO: Persist and aggregate results; reflect on Current Standings.
            No eliminations this round.
          </Alert>
        </Card.Body>
      </Card>

      <section className="mb-4">
        <h2 className="h5">Round Settings</h2>
        <GameSettingsAdminEditor roundId="round2" />
      </section>
    </Container>
  );
}

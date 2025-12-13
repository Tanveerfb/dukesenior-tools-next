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
import {
  computeRound5Marks,
  tourney5ExportRun,
  listRound5Runs,
} from "@/lib/services/phasmoTourney5";
import EliminatorCard from "@/components/tourney/EliminatorCard";

interface Player {
  id: string;
  name: string;
  status: "Active" | "Inactive" | "Eliminated";
}
interface Round5RunSummary {
  id: string;
  playerId: string;
  marks: number;
  officer: string;
  createdAt: number;
  notes?: string;
}

export default function Round5AdminPage() {
  const { user, admin } = useAuth();
  const officer = user?.displayName || user?.email || "Unknown";
  const [players, setPlayers] = useState<Player[]>([]);
  const [showRoundSettings, setShowRoundSettings] = useState(false);
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
  const [runs, setRuns] = useState<Round5RunSummary[]>([]);

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
      try {
        const list = await listRound5Runs();
        setRuns(list);
      } catch {}
    })();
  }, []);

  const sortedRuns = runs; // already ordered oldest-first from service

  const playerNameById = useMemo(() => {
    const map: Record<string, string> = {};
    players.forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, [players]);

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
    const marks = computeRound5Marks({
      objective1: form.objective1,
      objective2: form.objective2,
      objective3: form.objective3,
      ghostPicture: form.ghostPicture,
      bonePicture: form.bonePicture,
      survived: form.survived,
      correctGhostType: form.correctGhostType,
      perfectGame: form.perfectGame,
    });
    try {
      await tourney5ExportRun({
        officer,
        playerId: form.playerId,
        notes: form.notes,
        objective1: form.objective1,
        objective2: form.objective2,
        objective3: form.objective3,
        ghostPicture: form.ghostPicture,
        bonePicture: form.bonePicture,
        cursedItemUse: form.cursedItemUse,
        correctGhostType: form.correctGhostType,
        survived: form.survived,
        perfectGame: form.perfectGame,
        marks,
      });
      const list = await listRound5Runs();
      setRuns(list);
      resetForm();
    } catch (e: any) {
      alert(e?.message || "Failed to record run");
    }
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
      <h1 className="h4 fw-semibold mb-3">
        Round 5 — Tourney 5 Special (Admin)
      </h1>

      <section className="mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <h2 className="h5 mb-0">Round Settings</h2>
          <Button
            variant={showRoundSettings ? "outline-secondary" : "secondary"}
            onClick={() => setShowRoundSettings((v) => !v)}
          >
            {showRoundSettings ? "Hide" : "Show"}
          </Button>
        </div>
        {showRoundSettings && <GameSettingsAdminEditor roundId="round5" />}
      </section>

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

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Runs Summary (lowest first)
          </Card.Title>
          <Table responsive size="sm" className="mt-2">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Marks</th>
                <th>Officer</th>
                <th>Time</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sortedRuns.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{playerNameById[r.playerId] || r.playerId}</td>
                  <td>{r.marks}</td>
                  <td className="text-muted small">{r.officer}</td>
                  <td className="text-muted small">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="text-muted small">{r.notes || "-"}</td>
                </tr>
              ))}
              {sortedRuns.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted">
                    No runs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <section className="mt-4">
        <EliminatorCard />
      </section>
    </Container>
  );
}

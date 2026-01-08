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
} from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import GameSettingsAdminEditor from "../../../../../components/tourney/GameSettingsAdminEditor";
import {
  computeRound5Marks,
  tourney5ExportRun,
  listRound7Runs,
} from "@/lib/services/phasmoTourney5";
import BestOutOfThree from "../../../../../components/tourney/BestOutOfThree";

interface Player {
  id: string;
  name: string;
  status: "Active" | "Inactive" | "Eliminated";
}
interface RunSummary {
  id: string;
  playerId: string;
  marks: number;
  createdAt: number;
  officer: string;
  notes?: string;
}

export default function Round7AdminPage() {
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
  const [runs, setRuns] = useState<RunSummary[]>([]);

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
        const list = await listRound7Runs();
        setRuns(list);
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
      const list = await listRound7Runs();
      setRuns(list);
      resetForm();
    } catch (e: any) {
      alert(e?.message || "Failed to record run");
    }
  }

  const playerNameById = useMemo(() => {
    const map: Record<string, string> = {};
    players.forEach((p) => (map[p.id] = p.name));
    return map;
  }, [players]);

  if (!admin) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Admin access required.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-3">Round 7 — Finale (Admin)</h1>

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
        {showRoundSettings && <GameSettingsAdminEditor roundId="round7" />}
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
                    "ghostPicture",
                    "bonePicture",
                    "cursedItemUse",
                    "objective1",
                    "objective2",
                    "objective3",
                    "perfectGame",
                    "survived",
                    "correctGhostType",
                  ].map((key) => {
                    const labelMap: Record<string, string> = {
                      ghostPicture: "Ghost picture",
                      bonePicture: "Bone picture",
                      cursedItemUse: "Cursed item use",
                      objective1: "Objective 1",
                      objective2: "Objective 2",
                      objective3: "Objective 3",
                      perfectGame: "Perfect game",
                      survived: "Survived",
                      correctGhostType: "Correct ghost type",
                    };
                    return (
                      <Form.Check
                        key={key}
                        type="switch"
                        id={`toggle-${key}`}
                        label={labelMap[key]}
                        checked={(form as any)[key]}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            [key]: e.currentTarget.checked,
                          } as any)
                        }
                      />
                    );
                  })}
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

      <BestOutOfThree
        players={players}
        runs={runs.map((r) => ({
          id: r.id,
          playerId: r.playerId,
          marks: r.marks,
          createdAt: r.createdAt,
        }))}
        officer={officer}
      />
    </Container>
  );
}

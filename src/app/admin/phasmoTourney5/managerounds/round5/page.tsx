"use client";
import { useEffect, useState } from "react";
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
} from "@/lib/services/phasmoTourney5";
import EliminatorCard from "@/components/tourney/EliminatorCard";
import RecordedRunsTable from "@/components/tourney/RecordedRunsTable";

interface Player {
  id: string;
  name: string;
  status: "Active" | "Inactive" | "Eliminated";
}

export default function Round5AdminPage() {
  const { user, admin } = useAuth();
  const officer = user?.displayName || user?.email || "Unknown";
  const [players, setPlayers] = useState<Player[]>([]);
  const [showRoundSettings, setShowRoundSettings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
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
        roundId: "round5",
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
          {message && (
            <Alert
              variant={message.type === "success" ? "success" : "danger"}
              dismissible
              onClose={() => setMessage(null)}
            >
              {message.text}
            </Alert>
          )}
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
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={resetForm}
                disabled={submitting}
              >
                Reset
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <section className="mt-4">
        <RecordedRunsTable roundId="round5" showAdminControls={true} />
      </section>

      <section className="mt-4">
        <EliminatorCard />
      </section>
    </Container>
  );
}

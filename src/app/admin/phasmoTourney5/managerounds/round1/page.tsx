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

import GameSettingsAdminEditor from "../../../../../components/tourney/GameSettingsAdminEditor";
import {
  computeRound5Marks,
  tourney5ExportRun,
} from "@/lib/services/phasmoTourney5";
import EliminatorCard from "@/components/tourney/EliminatorCard";
import ImmunityAssigner from "@/components/tourney/ImmunityAssigner";
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
  const [wildcardState, setWildcardState] = useState<
    { name: string; used: boolean }[]
  >([]);
  const [editingWildcards, setEditingWildcards] = useState<string>("");
  const [showWildcardEditor, setShowWildcardEditor] = useState<boolean>(false);
  const [showRoundSettings, setShowRoundSettings] = useState<boolean>(false);
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
    // Load wildcard usage state
    (async () => {
      try {
        const res = await fetch(
          "/api/admin/phasmoTourney5/round1/wildcardsState",
          { cache: "no-cache" }
        );
        if (res.ok) {
          const state = await res.json();
          if (Array.isArray(state)) setWildcardState(state);
        }
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
      const id = await tourney5ExportRun({
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
      alert(`Run recorded (id: ${id}).`);
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
      <h1 className="h4 fw-semibold mb-3">Round 1 — Manage Runs (Admin)</h1>

      {/* Removed initial TODO alert section */}

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between">
            <Card.Title as="h2" className="h5 fw-semibold mb-0">
              Wildcard Choices
            </Card.Title>
            <div className="d-flex gap-2">
              <Button
                variant={showWildcardEditor ? "outline-secondary" : "secondary"}
                onClick={() => setShowWildcardEditor((v) => !v)}
              >
                {showWildcardEditor ? "Hide Editor" : "Edit Wildcards"}
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <Row className="g-2">
              {(wildcards.length ? wildcards : []).map((w) => {
                const used =
                  wildcardState.find((it) => it.name === w)?.used || false;
                return (
                  <Col key={w} xs={12} md={6} lg={4}>
                    <Card className={`h-100 ${used ? "opacity-50" : ""}`}>
                      <Card.Body className="d-flex align-items-center justify-content-between">
                        <span>{w}</span>
                        <Form.Check
                          type="switch"
                          id={`wc-${w}`}
                          label={used ? "Used" : "Available"}
                          checked={used}
                          onChange={() => {
                            setWildcardState((prev) => {
                              const next = [...prev];
                              const idx = next.findIndex((it) => it.name === w);
                              const nextUsed = !used;
                              if (idx >= 0)
                                next[idx] = { name: w, used: nextUsed };
                              else next.push({ name: w, used: nextUsed });
                              return next;
                            });
                          }}
                        />
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
            <div className="d-flex gap-2 mt-2">
              <Button
                variant="primary"
                onClick={async () => {
                  try {
                    const payload = wildcards.map((name) => ({
                      name,
                      used:
                        wildcardState.find((it) => it.name === name)?.used ||
                        false,
                    }));
                    const res = await fetch(
                      "/api/admin/phasmoTourney5/round1/wildcardsState",
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                      }
                    );
                    if (!res.ok) throw new Error("Failed to save state");
                    const saved = await res.json();
                    setWildcardState(saved);
                  } catch (e: any) {
                    alert(e?.message || "Failed to save wildcard state");
                  }
                }}
              >
                Save State
              </Button>
              <Button
                variant="outline-danger"
                onClick={async () => {
                  if (
                    !confirm(
                      "Reset all wildcard cards? This will clear usage state."
                    )
                  )
                    return;
                  try {
                    const res = await fetch(
                      "/api/admin/phasmoTourney5/round1/wildcardsState",
                      { method: "DELETE" }
                    );
                    if (!res.ok) throw new Error("Failed to reset state");
                    setWildcardState([]);
                  } catch (e: any) {
                    alert(e?.message || "Failed to reset wildcard state");
                  }
                }}
              >
                Reset Cards
              </Button>
            </div>
          </div>
          {/* Inline editor is toggled via button */}
          {showWildcardEditor && (
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
          )}
          {/* Removed duplicate inline editor; editor is now toggled above */}
        </Card.Body>
      </Card>

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
        {showRoundSettings && <GameSettingsAdminEditor roundId="round1" />}
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

      <section className="mt-4">
        <EliminatorCard />
      </section>

      <section className="mt-4">
        <ImmunityAssigner roundLabel="Round 1" />
      </section>

      {/* Removed bottom note alert */}
    </Container>
  );
}

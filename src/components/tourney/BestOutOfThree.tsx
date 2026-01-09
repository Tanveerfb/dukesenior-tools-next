"use client";
import { useMemo, useState } from "react";
import { Card, Col, Form, Row, Button } from "react-bootstrap";
import { addRound7FinaleResult } from "@/lib/services/phasmoTourney5";

interface Player {
  id: string;
  name: string;
}
interface Run {
  id: string;
  playerId: string;
  marks: number;
  createdAt: number;
}

type Outcome = "Player 1" | "Player 2" | "Tie" | "Pending";

export default function BestOutOfThree(props: {
  players: Player[];
  runs: Run[]; // Round 7 runs only
  officer?: string;
  onSaved?: (id: string) => void;
}) {
  const { players, runs, officer = "Unknown", onSaved } = props;
  const [p1, setP1] = useState<string>("");
  const [p2, setP2] = useState<string>("");
  const [rowSelections, setRowSelections] = useState<
    Array<{ p1RunId?: string; p2RunId?: string; outcome: Outcome }>
  >([{ outcome: "Pending" }, { outcome: "Pending" }, { outcome: "Pending" }]);

  const playerRuns = useMemo(() => {
    return {
      p1: runs.filter((r) => r.playerId === p1),
      p2: runs.filter((r) => r.playerId === p2),
    };
  }, [runs, p1, p2]);

  function computeOutcome(r1?: Run, r2?: Run): Outcome {
    if (!r1 || !r2) return "Pending";
    if (r1.marks > r2.marks) return "Player 1";
    if (r2.marks > r1.marks) return "Player 2";
    return "Tie";
  }

  const wins = rowSelections.reduce(
    (acc, row) => {
      if (row.outcome === "Player 1") acc.p1 += 1;
      else if (row.outcome === "Player 2") acc.p2 += 1;
      return acc;
    },
    { p1: 0, p2: 0 }
  );
  const disableRow3 =
    wins.p1 >= 2 ||
    wins.p2 >= 2 ||
    (rowSelections[0].outcome === "Player 1" &&
      rowSelections[1].outcome === "Player 1") ||
    (rowSelections[0].outcome === "Player 2" &&
      rowSelections[1].outcome === "Player 2");

  const finalWinner: Outcome =
    wins.p1 > wins.p2 ? "Player 1" : wins.p2 > wins.p1 ? "Player 2" : "Tie";

  async function saveResults() {
    if (!p1 || !p2) {
      alert("Select both players first");
      return;
    }
    const rows = rowSelections.map((row, _idx) => ({
      p1RunId: row.p1RunId,
      p2RunId: row.p2RunId,
      outcome:
        row.outcome !== "Pending"
          ? row.outcome
          : computeOutcome(
              runs.find((r) => r.id === row.p1RunId),
              runs.find((r) => r.id === row.p2RunId)
            ),
    }));
    try {
      const id = await addRound7FinaleResult({
        officer,
        player1Id: p1,
        player2Id: p2,
        rows,
        winner: finalWinner,
      });
      if (onSaved) onSaved(id);
      alert(`Finale saved (id: ${id})`);
    } catch (e: any) {
      alert(e?.message || "Failed to save finale");
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <Card.Title as="h2" className="h5 fw-semibold">
          Best of Three
        </Card.Title>
        <Row className="g-3 mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Player 1</Form.Label>
              <Form.Select
                value={p1}
                onChange={(e) => {
                  setP1(e.target.value);
                  setRowSelections([
                    { outcome: "Pending" },
                    { outcome: "Pending" },
                    { outcome: "Pending" },
                  ]);
                }}
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
            <Form.Group>
              <Form.Label>Player 2</Form.Label>
              <Form.Select
                value={p2}
                onChange={(e) => {
                  setP2(e.target.value);
                  setRowSelections([
                    { outcome: "Pending" },
                    { outcome: "Pending" },
                    { outcome: "Pending" },
                  ]);
                }}
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
        </Row>

        {[0, 1, 2].map((idx) => {
          const disabled = idx === 2 && disableRow3;
          const sel = rowSelections[idx];
          const r1 = playerRuns.p1.find((r) => r.id === sel.p1RunId);
          const r2 = playerRuns.p2.find((r) => r.id === sel.p2RunId);
          const outcome = computeOutcome(r1, r2);
          return (
            <Row
              className={`g-3 align-items-end ${idx < 2 ? "mb-2" : ""}`}
              key={idx}
            >
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Round {idx + 1} — Player 1 Run</Form.Label>
                  <Form.Select
                    value={sel.p1RunId || ""}
                    disabled={disabled || !p1}
                    onChange={(e) => {
                      const next = [...rowSelections];
                      next[idx] = {
                        ...sel,
                        p1RunId: e.target.value || undefined,
                      } as any;
                      setRowSelections(next);
                    }}
                  >
                    <option value="">Select run…</option>
                    {playerRuns.p1.map((r) => (
                      <option key={r.id} value={r.id}>
                        Marks {r.marks} —{" "}
                        {new Date(r.createdAt).toLocaleString()}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Round {idx + 1} — Player 2 Run</Form.Label>
                  <Form.Select
                    value={sel.p2RunId || ""}
                    disabled={disabled || !p2}
                    onChange={(e) => {
                      const next = [...rowSelections];
                      next[idx] = {
                        ...sel,
                        p2RunId: e.target.value || undefined,
                      } as any;
                      setRowSelections(next);
                    }}
                  >
                    <option value="">Select run…</option>
                    {playerRuns.p2.map((r) => (
                      <option key={r.id} value={r.id}>
                        Marks {r.marks} —{" "}
                        {new Date(r.createdAt).toLocaleString()}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Outcome</Form.Label>
                  <Form.Control value={outcome} disabled />
                </Form.Group>
              </Col>
            </Row>
          );
        })}
        <div className="d-flex gap-2 mt-3">
          <Button variant="primary" onClick={saveResults} disabled={!p1 || !p2}>
            Save Finale Result
          </Button>
          <Form.Text className="text-muted">Winner: {finalWinner}</Form.Text>
        </div>
      </Card.Body>
    </Card>
  );
}

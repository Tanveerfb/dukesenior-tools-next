"use client";
import { useEffect, useState } from "react";
import { Alert, Card, Col, Row, Spinner, Button, Badge } from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";

interface CandidateCount {
  candidateId: string;
  votes: number;
}
interface SessionTally {
  sessionId: string;
  counts: CandidateCount[];
  totalVotes: number;
  open: boolean;
  round: number;
  revealOrder?: string[]; // optional if extended in session doc fetch
  revealed?: boolean;
}

export default function VotingResults({ round }: { round: number }) {
  const { admin } = useAuth();
  const [sessions, setSessions] = useState<SessionTally[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const listRes = await fetch(
        `/api/t5/voting-sessions/list?round=${round}`
      );
      if (!listRes.ok) throw new Error(`List failed ${listRes.status}`);
      const raw = await listRes.json();
      const tallies: SessionTally[] = [];
      for (const s of raw) {
        const tRes = await fetch(
          `/api/t5/voting-sessions/tally?sessionId=${s.id}`
        );
        if (tRes.ok) {
          const t = await tRes.json();
          tallies.push({ ...t, sessionId: s.id, revealed: s.revealed });
        }
      }
      setSessions(
        tallies.sort((a, b) => b.round - a.round || b.totalVotes - a.totalVotes)
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [round]);

  async function persistReveal(sessionId: string) {
    try {
      const res = await fetch("/api/t5/voting-sessions/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, revealed: true }),
      });
      if (!res.ok) throw new Error(`Reveal failed ${res.status}`);
      setRevealed((r) => ({ ...r, [sessionId]: true }));
      // also update local session revealed flag
      setSessions((ss) =>
        ss.map((s) =>
          s.sessionId === sessionId ? { ...s, revealed: true } : s
        )
      );
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div>
      {error && (
        <Alert variant="danger" className="py-1 small">
          {error}
        </Alert>
      )}
      {loading && (
        <div className="d-flex align-items-center gap-2">
          <Spinner size="sm" /> Loading results…
        </div>
      )}
      {!loading && sessions.length === 0 && (
        <p className="text-muted small mb-0">No voting sessions yet.</p>
      )}
      <Row className="g-3">
        {sessions.map((session) => {
          const leaderVotes = Math.max(
            0,
            ...session.counts.map((c) => c.votes)
          );
          const isRevealed = revealed[session.sessionId] ?? !!session.revealed;
          return (
            <Col md={6} key={session.sessionId}>
              <Card className="shadow-sm h-100">
                <Card.Body className="small">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <strong>Session {session.sessionId.slice(0, 6)}</strong>{" "}
                      {session.open ? (
                        <Badge bg="success">Open</Badge>
                      ) : (
                        <Badge bg="secondary">Closed</Badge>
                      )}
                      <Badge bg="info" className="ms-2">
                        Round {session.round}
                      </Badge>
                    </div>
                    {admin && !isRevealed && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => persistReveal(session.sessionId)}
                      >
                        Reveal (persist)
                      </Button>
                    )}
                  </div>
                  {!isRevealed && (
                    <p className="text-muted mb-2">
                      Results hidden until revealed by admin.
                    </p>
                  )}
                  {isRevealed && (
                    <ul className="mb-2 ps-3">
                      {session.counts.map((c) => (
                        <li
                          key={c.candidateId}
                          className={
                            c.votes === leaderVotes && leaderVotes > 0
                              ? "fw-semibold"
                              : ""
                          }
                        >
                          {c.candidateId}: {c.votes} vote
                          {c.votes !== 1 ? "s" : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-muted mb-0">
                    Total votes: {session.totalVotes}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}

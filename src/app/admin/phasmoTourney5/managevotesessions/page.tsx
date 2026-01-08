"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Stack,
  Table,
} from "react-bootstrap";

interface Player {
  id: string;
  name: string;
  immune: boolean;
  status: "Active" | "Inactive" | "Eliminated";
}
interface Session {
  id: string;
  name: string;
  type: "vote-out" | "pick-ally";
  anonymous: boolean;
  subjectPlayerId?: string;
  selectionPool: string;
  closed: boolean;
  createdAt: number;
  closedAt?: number;
  link: string;
}
interface Vote {
  id: string;
  sessionId: string;
  voterUid: string;
  voterName: string;
  choicePlayerId: string;
  createdAt: number;
}

export default function ManageVoteSessionsPage() {
  const { admin, user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [votesBySession, setVotesBySession] = useState<Record<string, Vote[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<{
    name: string;
    type: "vote-out" | "pick-ally";
  }>({ name: "", type: "vote-out" });

  const [revealSession, setRevealSession] = useState<Session | null>(null);
  const [revealIndex, setRevealIndex] = useState(0);

  useEffect(() => {
    if (!admin) return;
    (async () => {
      setLoading(true);
      try {
        const [playersRes, sessionsRes] = await Promise.all([
          fetch("/api/admin/phasmoTourney5/players"),
          fetch("/api/admin/phasmoTourney5/votesessions"),
        ]);
        const p = await playersRes.json();
        const s = await sessionsRes.json();
        setPlayers(Array.isArray(p) ? p : []);
        setSessions(Array.isArray(s) ? s : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [admin]);

  // Poll votes for live counts
  useEffect(() => {
    if (!admin) return;
    const interval = setInterval(async () => {
      try {
        const active = sessions.filter((s) => !s.closed);
        const updates: Record<string, Vote[]> = {};
        await Promise.all(
          active.map(async (s) => {
            const res = await fetch(
              `/api/phasmoTourney5/votesessions/${s.id}/vote`
            );
            const v = await res.json();
            updates[s.id] = Array.isArray(v) ? v : [];
          })
        );
        setVotesBySession((prev) => ({ ...prev, ...updates }));
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [admin, sessions]);

  if (!admin) {
    return (
      <Container className="py-4">
        <Alert variant="warning" className="mb-0">
          Admin access required.{" "}
          <Link href="/login" className="alert-link">
            Log in
          </Link>
        </Alert>
      </Container>
    );
  }

  const activePlayers = players.filter((p) => p.status === "Active");
  const nonImmuneActive = activePlayers.filter((p) => !p.immune);

  async function handleCreateSession(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError("Name is required");
    try {
      const res = await fetch("/api/admin/phasmoTourney5/votesessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
        }),
      });
      if (!res.ok) throw new Error(`Failed to create: ${res.status}`);
      const created: Session = await res.json();
      setSessions((prev) => [created, ...prev]);
      setForm({ name: "", type: "vote-out" });
    } catch (e: any) {
      setError(e?.message || "Failed to create session");
    }
  }

  async function handleCloseSession(s: Session) {
    try {
      const res = await fetch(
        `/api/admin/phasmoTourney5/votesessions/${s.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ closed: true }),
        }
      );
      if (!res.ok) throw new Error(`Failed to close: ${res.status}`);
      const updated: Session = await res.json();
      setSessions((prev) =>
        prev.map((x) => (x.id === updated.id ? updated : x))
      );
    } catch (e: any) {
      setError(e?.message || "Failed to close session");
    }
  }

  function startReveal(s: Session) {
    setRevealSession(s);
    setRevealIndex(0);
    // load votes immediately
    (async () => {
      const res = await fetch(`/api/phasmoTourney5/votesessions/${s.id}/vote`);
      const vs = await res.json();
      setVotesBySession((prev) => ({
        ...prev,
        [s.id]: Array.isArray(vs) ? vs : [],
      }));
    })();
  }

  const revealVotes = revealSession
    ? votesBySession[revealSession.id] || []
    : [];

  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-4">Manage Vote Sessions</h1>

      {/* Admin status banner (useAuth.admin only) */}
      <Alert variant="success" className="mb-3">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <strong>Admin access confirmed</strong>{" "}
            <span className="ms-2">
              {user?.email ? (
                <>
                  Signed in as <Badge bg="success">{user.email}</Badge>
                </>
              ) : (
                "Not signed in"
              )}
            </span>
          </div>
        </div>
      </Alert>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Create New Session
          </Card.Title>
          <Form onSubmit={handleCreateSession} className="mt-3">
            {error && (
              <Alert
                variant="danger"
                onClose={() => setError(null)}
                dismissible
              >
                {error}
              </Alert>
            )}
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Type *</Form.Label>
                  <Form.Select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value as "vote-out" | "pick-ally",
                      })
                    }
                  >
                    <option value="vote-out">Vote Out</option>
                    <option value="pick-ally">Pick Ally</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <div className="text-muted small">
                    {form.type === "vote-out"
                      ? "Session is anonymous by rule."
                      : "Session is non-anonymous by rule."}
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <div className="p-2 border rounded">
                  <div className="small text-muted mb-2">
                    {form.type === "vote-out"
                      ? "Voters choose one from Non-Immune Active players."
                      : "Voters choose one ally from all Active players."}
                  </div>
                  <div className="small">
                    Pool size:{" "}
                    {form.type === "vote-out"
                      ? nonImmuneActive.length
                      : activePlayers.length}
                  </div>
                </div>
              </Col>
            </Row>
            <Stack direction="horizontal" gap={3}>
              <Button type="submit" variant="primary">
                Create Session
              </Button>
            </Stack>
          </Form>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Active Sessions
          </Card.Title>
          <Table responsive size="sm" className="mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Anonymous</th>
                <th>Votes</th>
                <th>Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions
                .filter((s) => !s.closed)
                .map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.type === "vote-out" ? "Vote Out" : "Pick Ally"}</td>
                    <td>{s.anonymous ? "Yes" : "No"}</td>
                    <td>{(votesBySession[s.id] || []).length}</td>
                    <td>
                      <code>{s.link}</code>
                    </td>
                    <td>
                      <Stack
                        direction="horizontal"
                        gap={2}
                        className="flex-wrap"
                      >
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => navigator.clipboard.writeText(s.link)}
                        >
                          Copy Link
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleCloseSession(s)}
                        >
                          Close
                        </Button>
                      </Stack>
                    </td>
                  </tr>
                ))}
              {sessions.filter((s) => !s.closed).length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted">
                    No active sessions.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Past Sessions
          </Card.Title>
          <Table responsive size="sm" className="mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Closed</th>
                <th>Votes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions
                .filter((s) => s.closed)
                .map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.type === "vote-out" ? "Vote Out" : "Pick Ally"}</td>
                    <td>
                      {s.closedAt ? new Date(s.closedAt).toLocaleString() : "-"}
                    </td>
                    <td>{(votesBySession[s.id] || []).length}</td>
                    <td>
                      <Stack
                        direction="horizontal"
                        gap={2}
                        className="flex-wrap"
                      >
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => startReveal(s)}
                        >
                          Reveal
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => navigator.clipboard.writeText(s.link)}
                        >
                          Copy Link
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={async () => {
                            const confirmed = window.confirm(
                              `Delete session "${s.name}"? This cannot be undone.`
                            );
                            if (!confirmed) return;
                            try {
                              const res = await fetch(
                                `/api/admin/phasmoTourney5/votesessions/${s.id}`,
                                { method: "DELETE" }
                              );
                              if (!res.ok)
                                throw new Error(`Delete failed: ${res.status}`);
                              setSessions((prev) =>
                                prev.filter((x) => x.id !== s.id)
                              );
                            } catch (e: any) {
                              setError(
                                e?.message || "Failed to delete session"
                              );
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </td>
                  </tr>
                ))}
              {sessions.filter((s) => s.closed).length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted">
                    No past sessions.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Reveal Modal */}
      <Modal
        show={!!revealSession}
        onHide={() => setRevealSession(null)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Reveal Votes — {revealSession?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {revealSession && (
            <div className="d-flex flex-column align-items-center gap-3">
              <div className="p-4 border rounded w-100 text-center">
                {revealVotes.length === 0 ? (
                  <div className="text-muted">No votes yet.</div>
                ) : (
                  <>
                    <div className="d-flex justify-content-between">
                      <div className="fw-semibold">
                        {revealSession.type === "vote-out"
                          ? "Voted Out:"
                          : "Picked Ally:"}
                      </div>
                      {!revealSession.anonymous && (
                        <div className="text-muted small">
                          Voter: {revealVotes[revealIndex]?.voterName}
                        </div>
                      )}
                    </div>
                    <div className="display-6 my-3">
                      {(() => {
                        const pid = revealVotes[revealIndex]?.choicePlayerId;
                        const p = players.find((x) => x.id === pid);
                        return p?.name || pid || "—";
                      })()}
                    </div>
                    <Stack
                      direction="horizontal"
                      gap={3}
                      className="justify-content-center"
                    >
                      <Button
                        variant="secondary"
                        onClick={() =>
                          setRevealIndex((i) => Math.max(0, i - 1))
                        }
                        disabled={revealIndex <= 0}
                      >
                        Prev
                      </Button>
                      <Badge bg="info">
                        {revealIndex + 1} / {revealVotes.length}
                      </Badge>
                      <Button
                        variant="primary"
                        onClick={() =>
                          setRevealIndex((i) =>
                            Math.min(revealVotes.length - 1, i + 1)
                          )
                        }
                        disabled={revealIndex >= revealVotes.length - 1}
                      >
                        Next
                      </Button>
                    </Stack>
                  </>
                )}
              </div>
              <div className="w-100">
                {(() => {
                  // Compute tally and top entry by votes
                  const tally: Record<string, number> = {};
                  for (const v of revealVotes) {
                    tally[v.choicePlayerId] =
                      (tally[v.choicePlayerId] || 0) + 1;
                  }
                  const sortedByVotes = Object.entries(tally).sort(
                    (a, b) => b[1] - a[1]
                  );
                  const topChoiceId = sortedByVotes[0]?.[0];
                  const topChoiceName =
                    players.find((p) => p.id === topChoiceId)?.name ||
                    topChoiceId;
                  return (
                    <div className="mb-2">
                      {revealSession.type === "vote-out" &&
                        revealVotes.length > 0 && (
                          <Badge bg="danger" className="me-2">
                            Voted Out
                          </Badge>
                        )}
                      <span className="fw-semibold">Top:</span>{" "}
                      <span className="text-danger fw-semibold">
                        {topChoiceName || "—"}
                      </span>{" "}
                      <span className="text-muted">
                        ({sortedByVotes[0]?.[1] || 0} votes)
                      </span>
                    </div>
                  );
                })()}
                <h3 className="h6">Recorded Entries</h3>
                <Table responsive size="sm" className="mt-2">
                  <thead>
                    <tr>
                      {!revealSession.anonymous && <th>Voter</th>}
                      <th>
                        {revealSession.type === "pick-ally"
                          ? "Selection"
                          : "Choice"}
                      </th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revealVotes
                      .slice()
                      .sort((a, b) => b.createdAt - a.createdAt) // descending by time
                      .map((v) => (
                        <tr key={v.id}>
                          {!revealSession.anonymous && (
                            <td className="text-muted small">{v.voterName}</td>
                          )}
                          <td>
                            {revealSession.type === "pick-ally" ? (
                              <span>
                                <span className="text-primary fw-semibold">
                                  {v.voterName}
                                </span>{" "}
                                picks{" "}
                                <span className="text-success fw-semibold">
                                  {players.find(
                                    (p) => p.id === v.choicePlayerId
                                  )?.name || v.choicePlayerId}
                                </span>
                              </span>
                            ) : (
                              players.find((p) => p.id === v.choicePlayerId)
                                ?.name || v.choicePlayerId
                            )}
                          </td>
                          <td className="text-muted small">
                            {new Date(v.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    {revealVotes.length === 0 && (
                      <tr>
                        <td
                          colSpan={revealSession.anonymous ? 2 : 3}
                          className="text-muted"
                        >
                          No entries.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRevealSession(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

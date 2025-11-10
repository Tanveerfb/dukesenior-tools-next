"use client";
import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { useAuth } from "@/hooks/useAuth";

interface SimpleSession {
  id: string;
  round: number;
  open: boolean;
  createdAt: number;
}

export default function Tourney5BracketPage() {
  const breadcrumbs = buildTourneyBreadcrumbs([
    {
      label: "Phasmo Tourney 5",
      href: "/phasmotourney-series/phasmotourney5",
    },
    { label: "Round Progress" },
  ]);
  return (
    <TourneyPage
      title="Round Progress & Bracket (Early)"
      subtitle="High-level snapshot for Phasmo Tourney 5 while the bracket scaffolding is under construction."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 5" }, { label: "Work in Progress" }]}
      containerProps={{ className: "py-3" }}
    >
      <Alert variant="info" className="small">
        Placeholder bracket view. Round 1 mechanics (wildcards, immunity,
        challenge) will be surfaced here. Voting logic temporarily removed
        pending overhaul.
      </Alert>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <Badge bg="primary">Round 1</Badge>
        <Badge bg="secondary">Upcoming: Round 2</Badge>
        <Badge bg="secondary">Upcoming: Round 3</Badge>
      </div>
      <Row className="g-3 mb-3">
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="fw-semibold">Round 1 Flow</h5>
              <ol className="small mb-0">
                <li>Each player draws 3 random wildcards and selects 1.</li>
                <li>
                  Runs executed on assigned map with chosen wildcard active.
                </li>
                <li>
                  Top 2 scores gain <strong>Immunity</strong> (tie: time, then
                  name).
                </li>
                <li>
                  Anonymous voting sessions (one vote per player) nominate
                  challenger.
                </li>
                <li>
                  Challenge phase: nominated may challenge non‑immune (logic
                  TBD).
                </li>
              </ol>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="fw-semibold">Status</h5>
              <VotingSessionsStatus />
              <hr />
              <Round2Scoreboard />
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline-primary"
                  href="/phasmotourney-series/phasmotourney5/round2-leaderboard"
                >
                  Open Round 2 Leaderboard
                </Button>
              </div>
              <hr />
              <Round3Section />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <p className="text-muted small mb-0">
        Data will populate once players and runs are recorded.
      </p>
    </TourneyPage>
  );
}

function VotingSessionsStatus() {
  const { admin, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SimpleSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [immune, setImmune] = useState<Record<string, boolean>>({});

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/t5/voting-sessions/list?round=1`);
      if (!res.ok) throw new Error(`List failed ${res.status}`);
      const data = await res.json();
      setSessions(
        (data as any[]).map((d) => ({
          id: d.id,
          round: d.round,
          open: d.open,
          createdAt: d.createdAt,
        }))
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
    // load players for immune selection
    fetch(`/api/t5/players/list`).then(async (r) => {
      if (r.ok) {
        const arr = await r.json();
        setPlayers(arr.map((p: any) => p.preferredName));
      }
    });
  }, []);

  async function createSession() {
    if (!admin) return;
    const immunePlayerIds = Object.entries(immune)
      .filter(([, v]) => v)
      .map(([k]) => k);
    setCreating(true);
    try {
      const res = await fetch(`/api/t5/voting-sessions/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ round: 1, immunePlayerIds }),
      });
      if (!res.ok) throw new Error(`Create failed ${res.status}`);
      setShowCreate(false);
      setImmune({});
      await refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }
  async function closeSession(id: string) {
    if (!admin) return;
    const res = await fetch(`/api/t5/voting-sessions/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id }),
    });
    if (res.ok) refresh();
    else setError(`Close failed ${res.status}`);
  }

  return (
    <div className="small">
      {error && (
        <Alert variant="danger" className="py-1 mb-2">
          {error}
        </Alert>
      )}
      {loading && (
        <div className="d-flex align-items-center gap-2">
          <Spinner size="sm" /> Loading sessions…
        </div>
      )}
      {!loading && sessions.length === 0 && (
        <p className="text-muted mb-2">No sessions yet.</p>
      )}
      {!loading && sessions.length > 0 && (
        <ul className="mb-2 ps-3">
          {sessions.map((s) => (
            <li key={s.id} className="mb-1">
              Session {s.id.slice(0, 6)} – {s.open ? "Open" : "Closed"}{" "}
              <Button
                size="sm"
                variant="outline-secondary"
                className="ms-2"
                href={`/phasmotourney-series/phasmotourney5/voting-sessions/1?session=${s.id}`}
              >
                View
              </Button>
              {s.open && admin && (
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="ms-2"
                  onClick={() => closeSession(s.id)}
                >
                  Close
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="d-flex flex-wrap gap-2">
        {admin && (
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            variant="primary"
          >
            Open Voting Session (Round 1)
          </Button>
        )}
        <Button
          size="sm"
          variant="outline-primary"
          href="/phasmotourney-series/phasmotourney5/voting-results"
        >
          View Results
        </Button>
      </div>
      {!user && <p className="text-muted mt-2 mb-0">Login required to vote.</p>}

      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Select Immune Players</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted">
            Mark players that are immune for Round 1. Immune players won't
            appear as vote options.
          </p>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            <Form>
              {players.map((name) => (
                <Form.Check
                  key={name}
                  type="checkbox"
                  id={`immune-${name}`}
                  label={name}
                  checked={!!immune[name]}
                  onChange={(e) =>
                    setImmune((m) => ({
                      ...m,
                      [name]: e.currentTarget.checked,
                    }))
                  }
                  className="mb-1"
                />
              ))}
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCreate(false)}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={createSession} disabled={creating}>
            {creating ? (
              <>
                <Spinner size="sm" className="me-1" /> Creating…
              </>
            ) : (
              "Create Session"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

function Round2Scoreboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<
    Array<{ player: string; money: number; map?: string }>
  >([]);
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/t5/round2/scoreboard`);
        if (!res.ok) throw new Error(`Round 2 load failed ${res.status}`);
        const data = await res.json();
        if (active) setRows(data);
      } catch (e: any) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mt-3">
      <h6 className="fw-semibold mb-2">Round 2 – Money Scores</h6>
      {error && (
        <Alert variant="danger" className="py-1 small mb-2">
          {error}
        </Alert>
      )}
      {loading && (
        <div className="d-flex align-items-center gap-2 small">
          <Spinner size="sm" /> Loading…
        </div>
      )}
      {!loading && rows.length === 0 && (
        <p className="text-muted small mb-0">No submissions yet.</p>
      )}
      {!loading && rows.length > 0 && (
        <Table bordered size="sm" className="small mb-0 align-middle">
          <thead>
            <tr>
              <th style={{ width: "40%" }}>Player</th>
              <th style={{ width: "30%" }}>Money ($)</th>
              <th style={{ width: "30%" }}>Map</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.player}>
                <td>{r.player}</td>
                <td className="fw-semibold">${r.money}</td>
                <td className="text-muted">{r.map || "—"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

function Round3Section() {
  const { admin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<
    Array<{ members: [string, string]; combinedMoney?: number; map?: string }>
  >([]);
  const [leftover, setLeftover] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [scoreboard, setScoreboard] = useState<
    Array<{ members: [string, string]; combinedMoney?: number; map?: string }>
  >([]);
  const [setting, setSetting] = useState(false);
  const [manualTeams, setManualTeams] = useState<string>("");
  const [manualLeftover, setManualLeftover] = useState<string>("");

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/t5/round3/teams`);
      const sb = await fetch(`/api/t5/round3/scoreboard`);
      if (!res.ok) throw new Error(`Teams load failed ${res.status}`);
      const data = await res.json();
      setTeams(
        (data.teams || []).map((x: any) => ({
          members: x.members,
          combinedMoney: x.combinedMoney,
          map: x.map,
        }))
      );
      setLeftover(data.leftover);
      if (sb.ok) setScoreboard(await sb.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  async function applyManualTeams() {
    if (!admin) return;
    setSetting(true);
    setError(null);
    try {
      // Input format: one team per line: "A,B"
      const lines = manualTeams
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean);
      const teamsArr = lines
        .map((line) =>
          line
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        )
        .filter((arr) => arr.length === 2);
      const res = await fetch(`/api/t5/round3/set-teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teams: teamsArr,
          leftover: manualLeftover || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || `Set teams failed ${res.status}`);
      await refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSetting(false);
    }
  }

  return (
    <div className="mt-3">
      <h6 className="fw-semibold mb-2">Round 3 – Teams & Elimination</h6>
      {error && (
        <Alert variant="danger" className="py-1 small mb-2">
          {error}
        </Alert>
      )}
      {loading && (
        <div className="d-flex align-items-center gap-2 small">
          <Spinner size="sm" /> Loading…
        </div>
      )}
      {!loading && (
        <>
          <div className="mb-2">
            <strong>Teams:</strong>
            {teams.length === 0 ? (
              <span className="text-muted ms-2">No teams yet</span>
            ) : (
              <ul className="mb-1 ps-3 small">
                {teams.map((t) => (
                  <li key={t.members.join("__")}>
                    {t.members.join(" & ")}{" "}
                    {typeof t.combinedMoney === "number" && (
                      <Badge bg="dark" className="ms-1">
                        ${t.combinedMoney}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {leftover && (
              <div className="small">
                Leftover (manual immunity elsewhere):{" "}
                <strong>{leftover}</strong>
              </div>
            )}
          </div>
          <div className="mb-2">
            <strong>Team Scoreboard:</strong>
            {scoreboard.length === 0 ? (
              <div className="text-muted small">No team runs yet.</div>
            ) : (
              <Table
                bordered
                size="sm"
                className="small mb-0 align-middle mt-1"
              >
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Money ($)</th>
                    <th>Map</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreboard.map((t) => (
                    <tr key={t.members.join("__")}>
                      <td>{t.members.join(" & ")}</td>
                      <td className="fw-semibold">
                        {typeof t.combinedMoney === "number"
                          ? `$${t.combinedMoney}`
                          : "—"}
                      </td>
                      <td className="text-muted">{t.map || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
          {admin && (
            <div className="mt-2">
              <h6 className="fw-semibold">Manual Teams (override)</h6>
              <p className="text-muted small mb-1">
                Enter one team per line as "Player A, Player B". Optionally set
                leftover.
              </p>
              <Form.Group className="mb-2">
                <Form.Label className="small mb-0">Teams</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  size="sm"
                  value={manualTeams}
                  onChange={(e) => setManualTeams(e.target.value)}
                  placeholder={"Alice,Bob\nCara,Dan\nEve,Fred"}
                />
              </Form.Group>
              <Row className="g-2">
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="small mb-0">
                      Leftover (optional)
                    </Form.Label>
                    <Form.Control
                      size="sm"
                      value={manualLeftover}
                      onChange={(e) => setManualLeftover(e.target.value)}
                      placeholder="Player name"
                    />
                  </Form.Group>
                </Col>
                <Col sm={6} className="d-flex align-items-end">
                  <Button
                    size="sm"
                    onClick={applyManualTeams}
                    disabled={setting}
                  >
                    {setting ? "Saving…" : "Apply"}
                  </Button>
                </Col>
              </Row>
            </div>
          )}
        </>
      )}
    </div>
  );
}

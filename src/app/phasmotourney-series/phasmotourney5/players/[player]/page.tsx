"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Tab,
  Table,
  Tabs,
} from "react-bootstrap";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { ROUND1_DEFAULT_WILDCARDS } from "@/lib/services/phasmoTourney5";
import { useAuth } from "@/hooks/useAuth";

interface PlayerState {
  name: string;
  selectedWildcard?: string;
  marks?: number;
  runTimeMs?: number;
  immune?: boolean;
  votedFor?: string;
  nominated?: boolean;
  eliminated?: boolean;
}
interface PlayerProfile {
  preferredName: string;
  twitch?: string;
  youtube?: string;
  steam?: string;
  phasmoHours?: number;
  prestigeAtAdmission?: string;
  previousTourney?: boolean;
  createdAt?: number;
}
interface PlayerChoices {
  player: string;
  choices: string[];
}

export default function PlayerAdminPage() {
  const params = useParams();
  const player = decodeURIComponent(params.player as string);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<PlayerState | null>(null);
  const [choices, setChoices] = useState<PlayerChoices | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [marks, setMarks] = useState("");
  const [runTime, setRunTime] = useState("");
  // Voting removed from profile page per request; anonymous voting handled via sessions pages.
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const res = await fetch(
      `/api/t5/round1/state?player=${encodeURIComponent(player)}`
    );
    if (res.ok) {
      const js = await res.json();
      setState(js.state);
      setChoices(js.choices);
    }
    const profRes = await fetch(`/api/t5/players/list`); // fetch all then filter (could add single endpoint later)
    if (profRes.ok) {
      const list: PlayerProfile[] = await profRes.json();
      const found = list.find(
        (p) => p.preferredName.toLowerCase() === player.toLowerCase()
      );
      setProfile(found || null);
    }
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, [player]);

  async function drawChoices() {
    setMessage(null);
    const res = await fetch("/api/t5/round1/choices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player }),
    });
    if (res.ok) {
      setMessage("Choices generated");
      refresh();
    }
  }
  async function selectWildcard(id: string) {
    setMessage(null);
    // confirm before locking in
    const label = choiceObjects.find((c) => c!.id === id)?.label || id;
    const ok = window.confirm(
      `Lock in wildcard: ${label}? This cannot be changed.`
    );
    if (!ok) return;
    const res = await fetch("/api/t5/round1/select-wildcard", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player, wildcardId: id }),
    });
    if (res.ok) {
      setMessage("Wildcard saved");
      refresh();
    }
  }
  async function submitRun() {
    if (!marks || !runTime) return;
    const res = await fetch("/api/t5/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player,
        marks: Number(marks),
        runTimeMs: Number(runTime),
      }),
    });
    if (res.ok) {
      setMessage("Run recorded");
      refresh();
    }
  }
  // submitVote removed – voting now occurs in dedicated voting session pages.

  const choiceObjects = (choices?.choices || [])
    .map((id) => ROUND1_DEFAULT_WILDCARDS.find((c) => c.id === id))
    .filter(Boolean);

  const { admin } = useAuth();
  const displayName = profile?.preferredName || player;
  const breadcrumbs = useMemo(
    () =>
      buildTourneyBreadcrumbs([
        {
          label: "Phasmo Tourney 5",
          href: "/phasmotourney-series/phasmotourney5",
        },
        {
          label: "Players",
          href: "/phasmotourney-series/phasmotourney5/players",
        },
        { label: displayName },
      ]),
    [displayName]
  );

  return (
    <TourneyPage
      title={displayName}
      subtitle={`Admin tools and run history for ${displayName}.`}
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 5" }, { label: "Player" }]}
      actions={[
        {
          label: "Back to roster",
          href: "/phasmotourney-series/phasmotourney5/players",
          variant: "outline-light",
        },
      ]}
      containerProps={{ className: "py-3" }}
    >
      {message && (
        <Alert variant="success" onClose={() => setMessage(null)} dismissible>
          {message}
        </Alert>
      )}
      {loading && <Spinner animation="border" />}
      {!loading && (
        <>
          <Row className="g-3">
            <Col md={12}>
              <Card className="shadow-sm">
                <Card.Body className="small">
                  <div className="d-flex flex-wrap gap-3">
                    <div>
                      <span className="text-muted">Prestige:</span>{" "}
                      {profile?.prestigeAtAdmission || "—"}
                    </div>
                    <div>
                      <span className="text-muted">Hours:</span>{" "}
                      {typeof profile?.phasmoHours === "number"
                        ? profile?.phasmoHours
                        : "—"}
                    </div>
                    <div>
                      <span className="text-muted">Prev Tourney:</span>{" "}
                      {profile?.previousTourney ? (
                        <Badge bg="success">Yes</Badge>
                      ) : (
                        <Badge bg="secondary">No</Badge>
                      )}
                    </div>
                    {profile?.twitch && (
                      <div>
                        <Badge bg="dark">Twitch</Badge> {profile.twitch}
                      </div>
                    )}
                    {profile?.youtube && (
                      <div>
                        <Badge bg="danger">YouTube</Badge> {profile.youtube}
                      </div>
                    )}
                    {profile?.steam && (
                      <div>
                        <Badge bg="primary">Steam</Badge> {profile.steam}
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Tabs defaultActiveKey="round1" className="mt-3">
            <Tab eventKey="round1" title="Round 1">
              <Row className="g-3 mt-1">
                <Col md={4}>
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <h5 className="fw-semibold">Wildcard</h5>
                      <div className="small mb-2">
                        {state?.selectedWildcard ? (
                          <Badge bg="success">{state.selectedWildcard}</Badge>
                        ) : (
                          "None selected"
                        )}
                      </div>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {admin && choiceObjects.length === 0 && (
                          <Button size="sm" onClick={drawChoices}>
                            Draw 3 Choices
                          </Button>
                        )}
                        {choiceObjects.map((c) => (
                          <Button
                            key={c!.id}
                            size="sm"
                            variant={
                              state?.selectedWildcard === c!.id
                                ? "success"
                                : "outline-primary"
                            }
                            disabled={!admin || !!state?.selectedWildcard}
                            onClick={() => selectWildcard(c!.id)}
                          >
                            {c!.label}
                          </Button>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <h5 className="fw-semibold">Run</h5>
                      <div className="small mb-2">
                        Marks: {state?.marks ?? "—"} / Time:{" "}
                        {state?.runTimeMs ?? "—"} ms
                      </div>
                      {admin && (
                        <Form.Group className="mb-2">
                          <Form.Label className="small">Marks</Form.Label>
                          <Form.Control
                            size="sm"
                            value={marks}
                            onChange={(e) => setMarks(e.target.value)}
                            placeholder="e.g. 120"
                          />
                        </Form.Group>
                      )}
                      {admin && (
                        <Form.Group className="mb-2">
                          <Form.Label className="small">
                            Run Time (ms)
                          </Form.Label>
                          <Form.Control
                            size="sm"
                            value={runTime}
                            onChange={(e) => setRunTime(e.target.value)}
                            placeholder="e.g. 305000"
                          />
                        </Form.Group>
                      )}
                      {admin && (
                        <Button
                          size="sm"
                          onClick={submitRun}
                          disabled={!marks || !runTime}
                        >
                          Save Run
                        </Button>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <h5 className="fw-semibold">Status</h5>
                      <div className="small">
                        Immune: {state?.immune ? "Yes" : "No"} | Nominated:{" "}
                        {state?.nominated ? "Yes" : "No"} | Eliminated:{" "}
                        {state?.eliminated ? "Yes" : "No"}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>
            <Tab eventKey="round2" title="Round 2">
              <Round2Tab player={player} admin={admin} />
            </Tab>
            <Tab eventKey="round3" title="Round 3">
              <Round3Tab player={player} admin={admin} />
            </Tab>
          </Tabs>
        </>
      )}
    </TourneyPage>
  );
}

function Round2Tab({ player, admin }: { player: string; admin: boolean }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [money, setMoney] = useState<string>("");
  const [map, setMap] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [current, setCurrent] = useState<{
    money?: number;
    map?: string;
    notes?: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/t5/round2/scoreboard`);
      if (!res.ok) throw new Error(`Load failed ${res.status}`);
      const list = await res.json();
      const me =
        (list as any[]).find(
          (e) => (e.player || "").toLowerCase() === player.toLowerCase()
        ) || null;
      setCurrent(me);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [player]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    if (!admin) return;
    setError(null);
    try {
      const payload = {
        player,
        money: Number(money),
        map: map || undefined,
        notes: notes || undefined,
      };
      const res = await fetch(`/api/t5/round2/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || `Submit failed ${res.status}`);
      setMoney("");
      setMap("");
      setNotes("");
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <Card className="shadow-sm mt-2">
      <Card.Body>
        <h5 className="fw-semibold">Money Round</h5>
        {error && (
          <Alert variant="danger" className="py-1 small">
            {error}
          </Alert>
        )}
        {loading && <Spinner size="sm" />}
        {!loading && (
          <>
            <div className="small mb-2">
              Current:{" "}
              {typeof current?.money === "number" ? `$${current!.money}` : "—"}
              {current?.map ? ` on ${current.map}` : ""}
            </div>
            {admin && (
              <div className="small">
                <Row className="g-2">
                  <Col sm={4}>
                    <Form.Group>
                      <Form.Label className="small">Money ($)</Form.Label>
                      <Form.Control
                        size="sm"
                        value={money}
                        onChange={(e) => setMoney(e.target.value)}
                        placeholder="e.g. 450"
                      />
                    </Form.Group>
                  </Col>
                  <Col sm={4}>
                    <Form.Group>
                      <Form.Label className="small">Map (optional)</Form.Label>
                      <Form.Control
                        size="sm"
                        value={map}
                        onChange={(e) => setMap(e.target.value)}
                        placeholder="e.g. Ridgeview"
                      />
                    </Form.Group>
                  </Col>
                  <Col sm={12}>
                    <Form.Group>
                      <Form.Label className="small">
                        Notes (optional)
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Allowed settings used (optional)"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={submit}
                  disabled={!money}
                >
                  Save Money Value
                </Button>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
}

// ---- Round 3 Tab ----
interface Round3TeamInfo {
  members: [string, string];
  combinedMoney?: number;
  map?: string;
}
function Round3Tab({ player, admin }: { player: string; admin: boolean }) {
  const [players, setPlayers] = useState<string[]>([]);
  const [voteTarget, setVoteTarget] = useState("");
  const [savingVote, setSavingVote] = useState(false);
  const [voteMessage, setVoteMessage] = useState<string | null>(null);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teams, setTeams] = useState<Round3TeamInfo[]>([]);
  const [leftover, setLeftover] = useState<string | undefined>(undefined);
  const [myTeam, setMyTeam] = useState<Round3TeamInfo | null>(null);
  const [teamMoney, setTeamMoney] = useState("");
  const [teamMap, setTeamMap] = useState("");
  const [submittingRun, setSubmittingRun] = useState(false);
  const [scoreboard, setScoreboard] = useState<Round3TeamInfo[]>([]);
  const [scoreboardLoading, setScoreboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lowerPlayer = player.toLowerCase();

  // Load player list for voting partner options
  useEffect(() => {
    fetch(`/api/t5/players/list`).then(async (r) => {
      if (r.ok) {
        const arr = await r.json();
        setPlayers(arr.map((p: any) => p.preferredName));
      }
    });
  }, []);

  // Load existing vote
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/t5/round3/vote`);
        if (res.ok) {
          const votes = await res.json();
          const mine = (votes as any[]).find(
            (v) => (v.voter || "").toLowerCase() === lowerPlayer
          );
          if (mine) setVoteTarget(mine.partner);
        }
      } catch {}
    })();
  }, [lowerPlayer]);

  // Load teams status
  const loadTeams = async () => {
    setTeamsLoading(true);
    try {
      const res = await fetch(`/api/t5/round3/teams`);
      if (res.ok) {
        const data = await res.json();
        const t: Round3TeamInfo[] = (data.teams || []).map((x: any) => ({
          members: x.members,
          combinedMoney: x.combinedMoney,
          map: x.map,
        }));
        setTeams(t);
        setLeftover(data.leftover);
        const mine =
          t.find((tt) =>
            tt.members.some((m) => m.toLowerCase() === lowerPlayer)
          ) || null;
        setMyTeam(mine);
        if (mine?.combinedMoney) setTeamMoney(String(mine.combinedMoney));
        if (mine?.map) setTeamMap(mine.map);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTeamsLoading(false);
    }
  };
  useEffect(() => {
    loadTeams();
  }, []);

  const loadScoreboard = async () => {
    setScoreboardLoading(true);
    try {
      const res = await fetch(`/api/t5/round3/scoreboard`);
      if (res.ok) {
        const data = await res.json();
        setScoreboard(data);
      }
    } finally {
      setScoreboardLoading(false);
    }
  };
  useEffect(() => {
    loadScoreboard();
  }, []);

  async function saveVote() {
    if (!voteTarget) return;
    setSavingVote(true);
    setVoteMessage(null);
    try {
      const res = await fetch(`/api/t5/round3/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter: player, partner: voteTarget }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Vote failed ${res.status}`);
      setVoteMessage("Vote saved");
    } catch (e: any) {
      setVoteMessage(e.message);
    } finally {
      setSavingVote(false);
    }
  }

  async function submitTeamRun() {
    if (!admin || !myTeam) return;
    setSubmittingRun(true);
    setError(null);
    try {
      const res = await fetch(`/api/t5/round3/submit-team-run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          members: myTeam.members,
          money: Number(teamMoney),
          map: teamMap || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || `Submit failed ${res.status}`);
      await loadTeams();
      await loadScoreboard();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmittingRun(false);
    }
  }

  const partnerOptions = players.filter((p) => p.toLowerCase() !== lowerPlayer);

  return (
    <Card className="shadow-sm mt-2">
      <Card.Body className="small">
        <h5 className="fw-semibold">Team Up Round</h5>
        <p className="text-muted mb-2">
          Players vote for a partner (non-anonymous). Admin will finalize teams
          from votes or manually later. Leftover player gains manual immunity
          (set elsewhere).
        </p>
        {error && (
          <Alert variant="danger" className="py-1">
            {error}
          </Alert>
        )}
        <Row className="g-3">
          <Col md={4}>
            <h6 className="fw-semibold">Partner Vote</h6>
            <Form.Select
              size="sm"
              value={voteTarget}
              onChange={(e) => setVoteTarget(e.target.value)}
              disabled={savingVote}
            >
              <option value="">Select partner…</option>
              {partnerOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Form.Select>
            <Button
              size="sm"
              className="mt-2"
              onClick={saveVote}
              disabled={!voteTarget || savingVote}
            >
              {savingVote ? "Saving…" : "Save Vote"}
            </Button>
            {voteMessage && <div className="mt-2 small">{voteMessage}</div>}
          </Col>
          <Col md={4}>
            <h6 className="fw-semibold">My Team</h6>
            {teamsLoading && <Spinner size="sm" />}
            {!teamsLoading && myTeam && (
              <div>
                <div className="mb-1">
                  Members: {myTeam.members.join(" & ")}
                </div>
                <div className="mb-1">
                  Combined Money:{" "}
                  {typeof myTeam.combinedMoney === "number"
                    ? `$${myTeam.combinedMoney}`
                    : "—"}
                </div>
                <div className="mb-1">Map: {myTeam.map || "—"}</div>
                {admin && (
                  <div className="mt-2">
                    <Form.Group className="mb-1">
                      <Form.Label className="small mb-0">
                        Team Money ($)
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        value={teamMoney}
                        onChange={(e) => setTeamMoney(e.target.value)}
                        placeholder="e.g. 800"
                      />
                    </Form.Group>
                    <Form.Group className="mb-1">
                      <Form.Label className="small mb-0">Map</Form.Label>
                      <Form.Control
                        size="sm"
                        value={teamMap}
                        onChange={(e) => setTeamMap(e.target.value)}
                        placeholder="Optional"
                      />
                    </Form.Group>
                    <Button
                      size="sm"
                      onClick={submitTeamRun}
                      disabled={!teamMoney || submittingRun}
                    >
                      {submittingRun ? "Submitting…" : "Save Team Run"}
                    </Button>
                  </div>
                )}
              </div>
            )}
            {!teamsLoading && !myTeam && (
              <div className="text-muted">
                Not assigned to a team yet
                {leftover && leftover.toLowerCase() === lowerPlayer
                  ? " (Leftover)"
                  : ""}
                .
              </div>
            )}
          </Col>
          <Col md={4}>
            <h6 className="fw-semibold">Teams</h6>
            {teamsLoading && <Spinner size="sm" />}
            {!teamsLoading && teams.length === 0 && (
              <div className="text-muted">No teams finalized.</div>
            )}
            {!teamsLoading && teams.length > 0 && (
              <ul className="mb-1 ps-3">
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
                Leftover: <strong>{leftover}</strong>
              </div>
            )}
          </Col>
        </Row>
        <hr />
        <h6 className="fw-semibold mb-2">Team Scoreboard</h6>
        {scoreboardLoading && <Spinner size="sm" />}
        {!scoreboardLoading && scoreboard.length === 0 && (
          <p className="text-muted mb-0">No team runs yet.</p>
        )}
        {!scoreboardLoading && scoreboard.length > 0 && (
          <Table bordered size="sm" className="small mb-0 align-middle">
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
      </Card.Body>
    </Card>
  );
}

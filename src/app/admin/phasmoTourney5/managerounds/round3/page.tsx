"use client";
import { useEffect, useMemo, useState } from "react";
import ImmunityAssigner from "@/components/tourney/ImmunityAssigner";
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
  listTeams,
  addTeamRunResult,
  listTeamRunResults,
} from "@/lib/services/phasmoTourney5";
import TeamsManager from "../../../../../components/tourney/TeamsManager";
import EliminatorCard from "@/components/tourney/EliminatorCard";

interface Team {
  id: string;
  teamName: string;
  members: string[]; // player names or ids
  totalMoney: number;
}

interface TeamRunResult {
  id: string;
  teamId: string;
  teamName: string;
  money: number;
  notes?: string;
  officer: string;
  createdAt: number;
}

export default function Round3AdminPage() {
  const { user, admin } = useAuth();
  const officer = user?.displayName || user?.email || "Unknown";
  const [players, setPlayers] = useState<
    Array<{ id: string; name: string; status: string }>
  >([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [results, setResults] = useState<TeamRunResult[]>([]);
  const [showRoundSettings, setShowRoundSettings] = useState(false);
  const [form, setForm] = useState<{
    teamId: string;
    money: string;
    notes: string;
  }>({
    teamId: "",
    money: "",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/phasmoTourney5/players");
        const json = await res.json();
        setPlayers(
          Array.isArray(json)
            ? json
                .filter((p: any) => p.status !== "Eliminated")
                .map((p: any) => ({ id: p.id, name: p.name, status: p.status }))
            : []
        );
      } catch {}
      try {
        const t = await listTeams();
        setTeams(t);
      } catch {}
      try {
        const r = await listTeamRunResults();
        setResults(r);
      } catch {}
    })();
  }, []);
  <Card className="border-0 shadow-sm mb-4">
    <Card.Body>
      <Card.Title as="h2" className="h5 fw-semibold">
        Manage Teams
      </Card.Title>
      <TeamsManager
        players={players}
        listTeams={listTeams}
        upsertTeam={async (p) => {
          // reuse existing Round 3 team services via upsertTeam/listTeams
          const { upsertTeam } = await import("@/lib/services/phasmoTourney5");
          return upsertTeam(p);
        }}
        deleteTeam={async (id) => {
          const { deleteTeam } = await import("@/lib/services/phasmoTourney5");
          return deleteTeam(id);
        }}
        showMoneyFields={true}
      />
    </Card.Body>
  </Card>;

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => b.money - a.money);
  }, [results]);

  function resetForm() {
    setForm({ teamId: "", money: "", notes: "" });
  }

  async function submitTeamResult(e: React.FormEvent) {
    e.preventDefault();
    const moneyNum = Number(form.money);
    if (!form.teamId || !isFinite(moneyNum)) return;
    const team = teams.find((t) => t.id === form.teamId);
    try {
      await addTeamRunResult({
        officer,
        teamId: form.teamId,
        teamName: team?.teamName || form.teamId,
        money: moneyNum,
        notes: form.notes || undefined,
      });
      const r = await listTeamRunResults();
      setResults(r);
      resetForm();
    } catch (e: any) {
      alert(e?.message || "Failed to record team result");
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
        Round 3 — Teams & Eliminator (Admin)
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
        {showRoundSettings && <GameSettingsAdminEditor roundId="round3" />}
      </section>

      <section className="mt-4">
        <ImmunityAssigner roundLabel="Round 3" />
      </section>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Record Team Run Results
          </Card.Title>
          <Form onSubmit={submitTeamResult} className="mt-3">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Officer</Form.Label>
                  <Form.Control value={officer} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Team</Form.Label>
                  <Form.Select
                    value={form.teamId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setForm({ ...form, teamId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select team…</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.teamName} ({t.members.join(" and ")})
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
            Team Results (descending)
          </Card.Title>
          <Table responsive size="sm" className="mt-2">
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
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
                  <td>{r.teamName}</td>
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
                  <td colSpan={6} className="text-muted">
                    No results yet.
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

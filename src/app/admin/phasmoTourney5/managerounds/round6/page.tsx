"use client";
import { useEffect, useMemo, useState } from "react";
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
  Table,
} from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import GameSettingsAdminEditor from "../../../../../components/tourney/GameSettingsAdminEditor";
import TeamsManager from "../../../../../components/tourney/TeamsManager";
import {
  listRound6Teams,
  upsertRound6Team,
  deleteRound6Team,
  listRound6TeamRunDetails,
  addRound6TeamRunDetail,
  deleteRound6TeamRunDetail,
} from "@/lib/services/phasmoTourney5";
import { computeRound5Marks } from "@/lib/services/phasmoTourney5";

interface Player {
  id: string;
  name: string;
  status: "Active" | "Inactive" | "Eliminated";
}
interface Team {
  id: string;
  teamName: string;
  members: string[];
  totalMoney: number;
}
interface TeamRunResult {
  id: string;
  teamId: string;
  teamName: string;
  marks: number;
  notes?: string;
  officer: string;
  createdAt: number;
}

export default function Round6AdminPage() {
  const { user, admin } = useAuth();
  const officer = user?.displayName || user?.email || "Unknown";
  const [players, setPlayers] = useState<Player[]>([]);
  const [showRoundSettings, setShowRoundSettings] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [results, setResults] = useState<TeamRunResult[]>([]);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    id: string | null;
  }>({ show: false, id: null });
  const [viewModal, setViewModal] = useState<{
    show: boolean;
    result: TeamRunResult | null;
  }>({ show: false, result: null });
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<any>({
    teamId: "",
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
      try {
        const t = await listRound6Teams();
        setTeams(t);
      } catch {}
      try {
        const r = await listRound6TeamRunDetails();
        setResults(r);
      } catch {}
    })();
  }, []);

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => a.createdAt - b.createdAt);
  }, [results]);

  async function handleDeleteResult() {
    if (!deleteModal.id) return;
    setDeleting(true);
    try {
      await deleteRound6TeamRunDetail(deleteModal.id);
      const r = await listRound6TeamRunDetails();
      setResults(r);
      setDeleteModal({ show: false, id: null });
    } catch (e: any) {
      alert("Failed to delete team run result: " + (e?.message || ""));
    } finally {
      setDeleting(false);
    }
  }

  async function submitTeamResult(e: React.FormEvent) {
    e.preventDefault();
    if (!form.teamId) return;
    const team = teams.find((t) => t.id === form.teamId);
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
      await addRound6TeamRunDetail({
        officer,
        teamId: form.teamId,
        teamName: team?.teamName || form.teamId,
        notes: form.notes || "",
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
      const r = await listRound6TeamRunDetails();
      setResults(r);
      setForm({
        teamId: "",
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
        Round 6 — Pick Your Friend (Admin)
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
        {showRoundSettings && <GameSettingsAdminEditor roundId="round6" />}
      </section>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Manage Teams
          </Card.Title>
          <TeamsManager
            players={players}
            listTeams={listRound6Teams}
            upsertTeam={upsertRound6Team}
            deleteTeam={deleteRound6Team}
            showMoneyFields={false}
          />
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Record Team Run Details
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
                    onChange={(e) =>
                      setForm({ ...form, teamId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select team…</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.teamName} (
                        {t.members
                          .map(
                            (id) => players.find((p) => p.id === id)?.name || id
                          )
                          .join(" and ")}
                        )
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
                    rows={3}
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
            <div className="d-flex gap-2 mt-2">
              <Button type="submit" variant="primary">
                Submit
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => setForm({ teamId: "", money: "", notes: "" })}
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
            Team Run Summary
          </Card.Title>
          <Table responsive size="sm" className="mt-2">
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>Marks</th>
                <th>Officer</th>
                <th>Time</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{r.teamName}</td>
                  <td>{(r as any).marks ?? "—"}</td>
                  <td className="text-muted small">{r.officer}</td>
                  <td className="text-muted small">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="text-muted small">{r.notes || "-"}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => setViewModal({ show: true, result: r })}
                      className="me-1"
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => setDeleteModal({ show: true, id: r.id })}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {sortedResults.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-muted">
                    No results yet.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, id: null })}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this team run result? This action
          cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ show: false, id: null })}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteResult}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Details Modal */}
      <Modal
        show={viewModal.show}
        onHide={() => setViewModal({ show: false, result: null })}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Team Run Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewModal.result && (
            <div>
              <p>
                <strong>Team:</strong> {viewModal.result.teamName}
              </p>
              <p>
                <strong>Marks:</strong>{" "}
                <Badge bg="success">
                  {(viewModal.result as any).marks ?? 0}
                </Badge>
              </p>
              <p>
                <strong>Officer:</strong> {viewModal.result.officer}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(viewModal.result.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Notes:</strong> {viewModal.result.notes || "None"}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setViewModal({ show: false, result: null })}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

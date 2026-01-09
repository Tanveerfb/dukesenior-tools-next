"use client";
import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Collapse,
  Badge,
  Modal,
  Spinner,
} from "react-bootstrap";
import { listRound5Runs, deleteRun } from "@/lib/services/phasmoTourney5";
import { useAuth } from "@/hooks/useAuth";

interface Run {
  id: string;
  playerId: string;
  roundId: string;
  marks: number;
  officer: string;
  createdAt: number;
  notes?: string;
  objective1?: boolean;
  objective2?: boolean;
  objective3?: boolean;
  ghostPicture?: boolean;
  bonePicture?: boolean;
  cursedItemUse?: boolean;
  correctGhostType?: boolean;
  survived?: boolean;
  perfectGame?: boolean;
}

interface Player {
  id: string;
  name: string;
}

interface Props {
  roundId?: string;
  showAdminControls?: boolean;
  onRunDeleted?: () => void;
}

export default function RecordedRunsTable({
  roundId,
  showAdminControls = false,
  onRunDeleted,
}: Props) {
  const { admin } = useAuth();
  const [runs, setRuns] = useState<Run[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    runId: string | null;
    playerName: string;
  }>({ show: false, runId: null, playerName: "" });
  const [deleting, setDeleting] = useState(false);
  const [detailsModal, setDetailsModal] = useState<{
    show: boolean;
    run: Run | null;
  }>({ show: false, run: null });

  useEffect(() => {
    loadData();
  }, [roundId]);

  async function loadData() {
    setLoading(true);
    try {
      const [runsData, playersData] = await Promise.all([
        listRound5Runs(roundId),
        fetch("/api/admin/phasmoTourney5/players").then((r) => r.json()),
      ]);
      setRuns(runsData);
      setPlayers(Array.isArray(playersData) ? playersData : []);
    } catch (error) {
      console.error("Failed to load runs:", error);
    } finally {
      setLoading(false);
    }
  }

  function getPlayerName(playerId: string): string {
    return players.find((p) => p.id === playerId)?.name || playerId;
  }

  async function handleDelete() {
    if (!deleteModal.runId) return;
    setDeleting(true);
    try {
      await deleteRun(deleteModal.runId);
      await loadData();
      if (onRunDeleted) onRunDeleted();
      setDeleteModal({ show: false, runId: null, playerName: "" });
    } catch (error: any) {
      alert(error?.message || "Failed to delete run");
    } finally {
      setDeleting(false);
    }
  }

  function openDeleteModal(run: Run) {
    const playerName = getPlayerName(run.playerId);
    setDeleteModal({ show: true, runId: run.id, playerName });
  }

  function openDetailsModal(run: Run) {
    setDetailsModal({ show: true, run });
  }

  function calculateScoreBreakdown(run: Run) {
    const objectivesCompleted = [
      run.objective1,
      run.objective2,
      run.objective3,
    ].filter(Boolean).length;
    const objectivePoints = Math.min(objectivesCompleted, 3) * 2;

    return {
      objectives: {
        completed: objectivesCompleted,
        points: objectivePoints,
      },
      ghostPicture: run.ghostPicture ? 5 : 0,
      bonePicture: run.bonePicture ? 3 : 0,
      survived: run.survived ? 3 : 0,
      correctGhostType: run.correctGhostType ? 3 : 0,
      perfectGame: run.perfectGame ? 5 : 0,
    };
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="text-center py-4">
          <Spinner animation="border" size="sm" className="me-2" />
          Loading recorded runs...
        </Card.Body>
      </Card>
    );
  }

  if (runs.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <p className="mb-0 text-muted">No recorded runs yet.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold mb-3">
            Recorded Runs ({runs.length})
          </Card.Title>
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Player</th>
                <th>Marks</th>
                <th>Officer</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => {
                const playerName = getPlayerName(run.playerId);
                return (
                  <tr key={run.id}>
                    <td>{playerName}</td>
                    <td>
                      <Badge bg="primary">{run.marks}</Badge>
                    </td>
                    <td>{run.officer}</td>
                    <td>{new Date(run.createdAt).toLocaleString()}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-info"
                        onClick={() => openDetailsModal(run)}
                      >
                        View
                      </Button>
                      {showAdminControls && admin && (
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="ms-2"
                          onClick={() => openDeleteModal(run)}
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal
        show={deleteModal.show}
        onHide={() =>
          setDeleteModal({ show: false, runId: null, playerName: "" })
        }
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the run for{" "}
          <strong>{deleteModal.playerName}</strong>? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() =>
              setDeleteModal({ show: false, runId: null, playerName: "" })
            }
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete Run"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={detailsModal.show}
        onHide={() => setDetailsModal({ show: false, run: null })}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Run Details & Score Breakdown</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailsModal.run && (
            <>
              <div className="mb-3">
                <h6 className="fw-bold">Run Information</h6>
                <Table size="sm" bordered>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Player</td>
                      <td>{getPlayerName(detailsModal.run.playerId)}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Officer</td>
                      <td>{detailsModal.run.officer}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Date</td>
                      <td>
                        {new Date(detailsModal.run.createdAt).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Final Score</td>
                      <td>
                        <Badge bg="primary" className="fs-6">
                          {detailsModal.run.marks} marks
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              <div className="mb-3">
                <h6 className="fw-bold">Score Calculation</h6>
                {(() => {
                  const breakdown = calculateScoreBreakdown(detailsModal.run);
                  const total =
                    breakdown.objectives.points +
                    breakdown.ghostPicture +
                    breakdown.bonePicture +
                    breakdown.survived +
                    breakdown.correctGhostType +
                    breakdown.perfectGame;
                  return (
                    <Table size="sm" bordered>
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Status</th>
                          <th className="text-end">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Objectives Completed</td>
                          <td>
                            {breakdown.objectives.completed} of 3 (2 pts each)
                          </td>
                          <td className="text-end">
                            {breakdown.objectives.points}
                          </td>
                        </tr>
                        <tr>
                          <td>Ghost Picture</td>
                          <td>{detailsModal.run.ghostPicture ? "✓" : "✗"}</td>
                          <td className="text-end">{breakdown.ghostPicture}</td>
                        </tr>
                        <tr>
                          <td>Bone Picture</td>
                          <td>{detailsModal.run.bonePicture ? "✓" : "✗"}</td>
                          <td className="text-end">{breakdown.bonePicture}</td>
                        </tr>
                        <tr>
                          <td>Survived</td>
                          <td>{detailsModal.run.survived ? "✓" : "✗"}</td>
                          <td className="text-end">{breakdown.survived}</td>
                        </tr>
                        <tr>
                          <td>Correct Ghost Type</td>
                          <td>
                            {detailsModal.run.correctGhostType ? "✓" : "✗"}
                          </td>
                          <td className="text-end">
                            {breakdown.correctGhostType}
                          </td>
                        </tr>
                        <tr>
                          <td>Perfect Game</td>
                          <td>{detailsModal.run.perfectGame ? "✓" : "✗"}</td>
                          <td className="text-end">{breakdown.perfectGame}</td>
                        </tr>
                        <tr className="table-active">
                          <td colSpan={2} className="fw-bold">
                            Total (max 25)
                          </td>
                          <td className="text-end fw-bold">
                            {Math.min(total, 25)}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  );
                })()}
              </div>

              <div>
                <h6 className="fw-bold">Additional Information</h6>
                <Table size="sm" bordered>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Cursed Item Used</td>
                      <td>{detailsModal.run.cursedItemUse ? "Yes" : "No"}</td>
                    </tr>
                    {detailsModal.run.notes && (
                      <tr>
                        <td className="fw-semibold">Notes</td>
                        <td>{detailsModal.run.notes}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setDetailsModal({ show: false, run: null })}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

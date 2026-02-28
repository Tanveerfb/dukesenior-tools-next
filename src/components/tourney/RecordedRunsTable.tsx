"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
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
      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
        <div className="text-center py-4 px-4 flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading recorded runs...
        </div>
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
        <div className="p-4">
          <p className="mb-0 text-foreground-secondary">No recorded runs yet.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-3">
            Recorded Runs ({runs.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border dark:border-border-dark">
                  <th className="text-left py-2 px-2">Player</th>
                  <th className="text-left py-2 px-2">Marks</th>
                  <th className="text-left py-2 px-2">Officer</th>
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => {
                  const playerName = getPlayerName(run.playerId);
                  return (
                    <tr
                      key={run.id}
                      className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <td className="py-2 px-2">{playerName}</td>
                      <td className="py-2 px-2">
                        <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-primary-500 text-white">
                          {run.marks}
                        </span>
                      </td>
                      <td className="py-2 px-2">{run.officer}</td>
                      <td className="py-2 px-2">
                        {new Date(run.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 px-2">
                        <button
                          type="button"
                          className="text-sm px-3 py-1.5 rounded-lg border border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white transition-colors"
                          onClick={() => openDetailsModal(run)}
                        >
                          View
                        </button>
                        {showAdminControls && admin && (
                          <button
                            type="button"
                            className="text-sm px-3 py-1.5 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors ml-2"
                            onClick={() => openDeleteModal(run)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() =>
              setDeleteModal({ show: false, runId: null, playerName: "" })
            }
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark">
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
              <button
                type="button"
                className="text-foreground-secondary hover:text-foreground"
                onClick={() =>
                  setDeleteModal({ show: false, runId: null, playerName: "" })
                }
              >
                &#x2715;
              </button>
            </div>
            <div className="p-4">
              Are you sure you want to delete the run for{" "}
              <strong>{deleteModal.playerName}</strong>? This action cannot be
              undone.
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border dark:border-border-dark">
              <button
                type="button"
                className="bg-gray-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                onClick={() =>
                  setDeleteModal({ show: false, runId: null, playerName: "" })
                }
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Run"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModal.show && detailsModal.run && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setDetailsModal({ show: false, run: null })}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark">
              <h3 className="text-lg font-semibold">
                Run Details &amp; Score Breakdown
              </h3>
              <button
                type="button"
                className="text-foreground-secondary hover:text-foreground"
                onClick={() => setDetailsModal({ show: false, run: null })}
              >
                &#x2715;
              </button>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <h6 className="font-bold mb-2">Run Information</h6>
                <table className="w-full border-collapse text-sm border border-border dark:border-border-dark">
                  <tbody>
                    <tr className="border-b border-border dark:border-border-dark">
                      <td className="font-semibold py-1.5 px-2 border-r border-border dark:border-border-dark">
                        Player
                      </td>
                      <td className="py-1.5 px-2">
                        {getPlayerName(detailsModal.run.playerId)}
                      </td>
                    </tr>
                    <tr className="border-b border-border dark:border-border-dark">
                      <td className="font-semibold py-1.5 px-2 border-r border-border dark:border-border-dark">
                        Officer
                      </td>
                      <td className="py-1.5 px-2">
                        {detailsModal.run.officer}
                      </td>
                    </tr>
                    <tr className="border-b border-border dark:border-border-dark">
                      <td className="font-semibold py-1.5 px-2 border-r border-border dark:border-border-dark">
                        Date
                      </td>
                      <td className="py-1.5 px-2">
                        {new Date(
                          detailsModal.run.createdAt
                        ).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold py-1.5 px-2 border-r border-border dark:border-border-dark">
                        Final Score
                      </td>
                      <td className="py-1.5 px-2">
                        <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-primary-500 text-white">
                          {detailsModal.run.marks} marks
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-3">
                <h6 className="font-bold mb-2">Score Calculation</h6>
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
                    <table className="w-full border-collapse text-sm border border-border dark:border-border-dark">
                      <thead>
                        <tr className="border-b border-border dark:border-border-dark">
                          <th className="text-left py-1.5 px-2">Category</th>
                          <th className="text-left py-1.5 px-2">Status</th>
                          <th className="text-right py-1.5 px-2">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border dark:border-border-dark">
                          <td className="py-1.5 px-2">
                            Objectives Completed
                          </td>
                          <td className="py-1.5 px-2">
                            {breakdown.objectives.completed} of 3 (2 pts each)
                          </td>
                          <td className="text-right py-1.5 px-2">
                            {breakdown.objectives.points}
                          </td>
                        </tr>
                        <tr className="border-b border-border dark:border-border-dark">
                          <td className="py-1.5 px-2">Ghost Picture</td>
                          <td className="py-1.5 px-2">
                            {detailsModal.run.ghostPicture ? "\u2713" : "\u2717"}
                          </td>
                          <td className="text-right py-1.5 px-2">
                            {breakdown.ghostPicture}
                          </td>
                        </tr>
                        <tr className="border-b border-border dark:border-border-dark">
                          <td className="py-1.5 px-2">Bone Picture</td>
                          <td className="py-1.5 px-2">
                            {detailsModal.run.bonePicture ? "\u2713" : "\u2717"}
                          </td>
                          <td className="text-right py-1.5 px-2">
                            {breakdown.bonePicture}
                          </td>
                        </tr>
                        <tr className="border-b border-border dark:border-border-dark">
                          <td className="py-1.5 px-2">Survived</td>
                          <td className="py-1.5 px-2">
                            {detailsModal.run.survived ? "\u2713" : "\u2717"}
                          </td>
                          <td className="text-right py-1.5 px-2">
                            {breakdown.survived}
                          </td>
                        </tr>
                        <tr className="border-b border-border dark:border-border-dark">
                          <td className="py-1.5 px-2">Correct Ghost Type</td>
                          <td className="py-1.5 px-2">
                            {detailsModal.run.correctGhostType ? "\u2713" : "\u2717"}
                          </td>
                          <td className="text-right py-1.5 px-2">
                            {breakdown.correctGhostType}
                          </td>
                        </tr>
                        <tr className="border-b border-border dark:border-border-dark">
                          <td className="py-1.5 px-2">Perfect Game</td>
                          <td className="py-1.5 px-2">
                            {detailsModal.run.perfectGame ? "\u2713" : "\u2717"}
                          </td>
                          <td className="text-right py-1.5 px-2">
                            {breakdown.perfectGame}
                          </td>
                        </tr>
                        <tr className="bg-black/5 dark:bg-white/5">
                          <td colSpan={2} className="font-bold py-1.5 px-2">
                            Total (max 25)
                          </td>
                          <td className="text-right font-bold py-1.5 px-2">
                            {Math.min(total, 25)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  );
                })()}
              </div>

              <div>
                <h6 className="font-bold mb-2">Additional Information</h6>
                <table className="w-full border-collapse text-sm border border-border dark:border-border-dark">
                  <tbody>
                    <tr className="border-b border-border dark:border-border-dark">
                      <td className="font-semibold py-1.5 px-2 border-r border-border dark:border-border-dark">
                        Cursed Item Used
                      </td>
                      <td className="py-1.5 px-2">
                        {detailsModal.run.cursedItemUse ? "Yes" : "No"}
                      </td>
                    </tr>
                    {detailsModal.run.notes && (
                      <tr>
                        <td className="font-semibold py-1.5 px-2 border-r border-border dark:border-border-dark">
                          Notes
                        </td>
                        <td className="py-1.5 px-2">
                          {detailsModal.run.notes}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end px-4 py-3 border-t border-border dark:border-border-dark">
              <button
                type="button"
                className="bg-gray-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                onClick={() => setDetailsModal({ show: false, run: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
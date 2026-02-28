"use client";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
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
            : [],
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 p-4 text-yellow-800 dark:text-yellow-200">
          Admin access required.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold mb-3 text-foreground">
        Round 6 — Pick Your Friend (Admin)
      </h1>

      <section className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Round Settings
          </h2>
          <button
            type="button"
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              showRoundSettings
                ? "border border-gray-400 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                : "bg-gray-500 text-white hover:bg-gray-600",
            )}
            onClick={() => setShowRoundSettings((v) => !v)}
          >
            {showRoundSettings ? "Hide" : "Show"}
          </button>
        </div>
        {showRoundSettings && <GameSettingsAdminEditor roundId="round6" />}
      </section>

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold text-foreground">
            Manage Teams
          </h2>
          <TeamsManager
            players={players}
            listTeams={listRound6Teams}
            upsertTeam={upsertRound6Team}
            deleteTeam={deleteRound6Team}
            showMoneyFields={false}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold text-foreground">
            Record Team Run Details
          </h2>
          <form onSubmit={submitTeamResult} className="mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Officer
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-border bg-gray-100 dark:bg-gray-800 dark:border-border-dark p-2 text-foreground opacity-60 cursor-not-allowed"
                    value={officer}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Team
                  </label>
                  <select
                    className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                            (id) =>
                              players.find((p) => p.id === id)?.name || id,
                          )
                          .join(" and ")}
                        )
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-wrap gap-3">
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
                    <label
                      key={key}
                      className="relative inline-flex items-center cursor-pointer gap-2"
                    >
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        id={`toggle-${key}`}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            [key]: e.currentTarget.checked,
                          } as any)
                        }
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                      <span className="text-sm text-foreground">
                        {labelMap[key]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                Submit
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-400 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setForm({ teamId: "", money: "", notes: "" })}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
        <div className="p-4">
          <h2 className="text-base font-semibold text-foreground">
            Team Run Summary
          </h2>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm text-foreground">
              <thead>
                <tr className="border-b border-border dark:border-border-dark">
                  <th className="text-left p-2">#</th>
                  <th className="text-left p-2">Team</th>
                  <th className="text-left p-2">Marks</th>
                  <th className="text-left p-2">Officer</th>
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Notes</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-b border-border/50 dark:border-border-dark/50"
                  >
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{r.teamName}</td>
                    <td className="p-2">{(r as any).marks ?? "—"}</td>
                    <td className="p-2 text-muted-foreground text-xs">
                      {r.officer}
                    </td>
                    <td className="p-2 text-muted-foreground text-xs">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="p-2 text-muted-foreground text-xs">
                      {r.notes || "-"}
                    </td>
                    <td className="p-2">
                      <button
                        type="button"
                        className="text-sm px-3 py-1.5 rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors mr-1"
                        onClick={() => setViewModal({ show: true, result: r })}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="text-sm px-3 py-1.5 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        onClick={() => setDeleteModal({ show: true, id: r.id })}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {sortedResults.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-2 text-muted-foreground">
                      No results yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-xl shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-border-dark">
              <h3 className="text-lg font-semibold text-foreground">
                Confirm Delete
              </h3>
              <button
                type="button"
                onClick={() => setDeleteModal({ show: false, id: null })}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="p-4 text-foreground">
              Are you sure you want to delete this team run result? This action
              cannot be undone.
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border dark:border-border-dark">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors disabled:opacity-50"
                onClick={() => setDeleteModal({ show: false, id: null })}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                onClick={handleDeleteResult}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-xl shadow-lg w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-border-dark">
              <h3 className="text-lg font-semibold text-foreground">
                Team Run Details
              </h3>
              <button
                type="button"
                onClick={() => setViewModal({ show: false, result: null })}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {viewModal.result && (
                <div className="space-y-2 text-foreground">
                  <p>
                    <strong>Team:</strong> {viewModal.result.teamName}
                  </p>
                  <p>
                    <strong>Marks:</strong>{" "}
                    <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {(viewModal.result as any).marks ?? 0}
                    </span>
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
            </div>
            <div className="flex justify-end p-4 border-t border-border dark:border-border-dark">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                onClick={() => setViewModal({ show: false, result: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import ImmunityAssigner from "@/components/tourney/ImmunityAssigner";
import { useAuth } from "@/hooks/useAuth";
import GameSettingsAdminEditor from "../../../../../components/tourney/GameSettingsAdminEditor";
import {
  listTeams,
  addTeamRunResult,
  listTeamRunResults,
  deleteTeamRunResult,
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
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    resultId: string | null;
  }>({ show: false, resultId: null });
  const [viewModal, setViewModal] = useState<{
    show: boolean;
    result: TeamRunResult | null;
  }>({ show: false, result: null });
  const [deleting, setDeleting] = useState(false);

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
            : [],
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

  async function handleDeleteResult() {
    if (!deleteModal.resultId) return;
    setDeleting(true);
    try {
      await deleteTeamRunResult(deleteModal.resultId);
      const r = await listTeamRunResults();
      setResults(r);
      setDeleteModal({ show: false, resultId: null });
    } catch (e: any) {
      alert(e?.message || "Failed to delete result");
    } finally {
      setDeleting(false);
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
        Round 3 — Teams & Eliminator (Admin)
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
        {showRoundSettings && <GameSettingsAdminEditor roundId="round3" />}
      </section>

      <section className="mt-4">
        <ImmunityAssigner roundLabel="Round 3" />
      </section>

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold text-foreground">
            Manage Teams
          </h2>
          <TeamsManager
            players={players}
            listTeams={listTeams}
            upsertTeam={async (p) => {
              const { upsertTeam } =
                await import("@/lib/services/phasmoTourney5");
              return upsertTeam(p);
            }}
            deleteTeam={async (id) => {
              const { deleteTeam } =
                await import("@/lib/services/phasmoTourney5");
              return deleteTeam(id);
            }}
            showMoneyFields={true}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold text-foreground">
            Record Team Run Results
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
                  </select>
                </div>
              </div>
              <div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Money earned
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    inputMode="numeric"
                    className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={form.money}
                    onChange={(e) =>
                      setForm({ ...form, money: e.target.value })
                    }
                    required
                  />
                </div>
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
                onClick={resetForm}
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
            Team Results (descending)
          </h2>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm text-foreground">
              <thead>
                <tr className="border-b border-border dark:border-border-dark">
                  <th className="text-left p-2">#</th>
                  <th className="text-left p-2">Team</th>
                  <th className="text-left p-2">Money</th>
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
                    <td className="p-2">${r.money.toLocaleString()}</td>
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
                        className="text-sm px-3 py-1.5 rounded-lg border border-cyan-500 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
                        onClick={() => setViewModal({ show: true, result: r })}
                      >
                        View
                      </button>
                      {admin && (
                        <button
                          type="button"
                          className="text-sm px-3 py-1.5 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-2"
                          onClick={() =>
                            setDeleteModal({ show: true, resultId: r.id })
                          }
                        >
                          Delete
                        </button>
                      )}
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
                onClick={() => setDeleteModal({ show: false, resultId: null })}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="p-4 text-foreground">
              Are you sure you want to delete this team result? This action
              cannot be undone.
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border dark:border-border-dark">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors disabled:opacity-50"
                onClick={() => setDeleteModal({ show: false, resultId: null })}
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
                {deleting ? "Deleting..." : "Delete Result"}
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
                Team Result Details
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
                <table className="w-full text-sm text-foreground border border-border dark:border-border-dark">
                  <tbody>
                    <tr className="border-b border-border dark:border-border-dark">
                      <td className="p-2 font-semibold">Team</td>
                      <td className="p-2">{viewModal.result.teamName}</td>
                    </tr>
                    <tr className="border-b border-border dark:border-border-dark">
                      <td className="p-2 font-semibold">Money Earned</td>
                      <td className="p-2">
                        <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          ${viewModal.result.money.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-border dark:border-border-dark">
                      <td className="p-2 font-semibold">Officer</td>
                      <td className="p-2">{viewModal.result.officer}</td>
                    </tr>
                    <tr className="border-b border-border dark:border-border-dark">
                      <td className="p-2 font-semibold">Date</td>
                      <td className="p-2">
                        {new Date(viewModal.result.createdAt).toLocaleString()}
                      </td>
                    </tr>
                    {viewModal.result.notes && (
                      <tr className="border-b border-border dark:border-border-dark">
                        <td className="p-2 font-semibold">Notes</td>
                        <td className="p-2">{viewModal.result.notes}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
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

      <section className="mt-4">
        <EliminatorCard />
      </section>
    </div>
  );
}

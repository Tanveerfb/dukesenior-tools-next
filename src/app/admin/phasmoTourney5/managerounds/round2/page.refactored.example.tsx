/**
 * EXAMPLE: Refactored Round 2 Admin Page
 *
 * This is a demonstration of how the modular components can be used
 * to simplify admin pages. The original page is 240 lines, while this
 * refactored version is more maintainable and follows DRY principles.
 *
 * Key improvements:
 * - AdminAuthGuard handles authentication check
 * - AdminPageLayout provides consistent page structure
 * - useAdminPlayers handles player data fetching
 * - PlayerSelector provides consistent player selection UI
 * - FormCard wraps form with consistent styling
 *
 * This pattern can be applied to all admin pages for consistency.
 */

"use client";
import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  AdminAuthGuard,
  AdminPageLayout,
  useAdminPlayers,
  PlayerSelector,
  FormCard,
} from "@/components/admin";
import GameSettingsAdminEditor from "../../../../../components/tourney/GameSettingsAdminEditor";
import {
  addRound2MoneyResult,
  listRound2MoneyResults,
} from "@/lib/services/phasmoTourney5";

interface Result {
  id: string;
  playerId: string;
  playerName: string;
  money: number;
  notes?: string;
  officer: string;
  createdAt: number;
}

export default function Round2ManageMoneyPageRefactored() {
  const { user } = useAuth();
  const officer = user?.displayName || user?.email || "Unknown";

  // Use custom hook for player data
  const { players } = useAdminPlayers();

  const [results, setResults] = useState<Result[]>([]);
  const [showRoundSettings, setShowRoundSettings] = useState(false);
  const [form, setForm] = useState({
    playerId: "",
    money: "",
    notes: "",
  });

  useEffect(() => {
    listRound2MoneyResults().then(setResults).catch(console.error);
  }, []);

  const sortedResults = useMemo(
    () => [...results].sort((a, b) => b.money - a.money),
    [results],
  );

  const resetForm = () => {
    setForm({ playerId: "", money: "", notes: "" });
  };

  const submitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    const moneyNum = Number(form.money);
    if (!form.playerId || !isFinite(moneyNum)) return;

    const player = players.find((p) => p.id === form.playerId);
    try {
      await addRound2MoneyResult({
        officer,
        playerId: form.playerId,
        playerName: player?.name || form.playerId,
        money: moneyNum,
        notes: form.notes || undefined,
      });
      const list = await listRound2MoneyResults();
      setResults(list);
      resetForm();
    } catch (e: any) {
      alert(e?.message || "Failed to record result");
    }
  };

  return (
    <AdminAuthGuard>
      <AdminPageLayout
        title="Round 2 — Money Round"
        subtitle="Record and view money earned by players"
      >
        <FormCard
          title="Record Money Results"
          onSubmit={submitResult}
          submitLabel="Submit Result"
        >
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
              <PlayerSelector
                players={players}
                value={form.playerId}
                onChange={(id) => setForm({ ...form, playerId: id })}
                label="Player"
                required
              />
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
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={form.money}
                  onChange={(e) => setForm({ ...form, money: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
          </div>
        </FormCard>

        <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4">
          <div className="p-4">
            <h2 className="text-base font-semibold text-foreground">
              Results (descending)
            </h2>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm text-foreground">
                <thead>
                  <tr className="border-b border-border dark:border-border-dark">
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">Player</th>
                    <th className="text-left p-2">Money</th>
                    <th className="text-left p-2">Officer</th>
                    <th className="text-left p-2">Time</th>
                    <th className="text-left p-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((r, i) => (
                    <tr
                      key={r.id}
                      className="border-b border-border/50 dark:border-border-dark/50"
                    >
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2">{r.playerName}</td>
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
                    </tr>
                  ))}
                  {sortedResults.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-2 text-muted-foreground">
                        No results yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

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
          {showRoundSettings && <GameSettingsAdminEditor roundId="round2" />}
        </section>
      </AdminPageLayout>
    </AdminAuthGuard>
  );
}

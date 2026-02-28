"use client";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import GameSettingsAdminEditor from "../../../../../components/tourney/GameSettingsAdminEditor";
import {
  addRound2MoneyResult,
  listRound2MoneyResults,
} from "@/lib/services/phasmoTourney5";

interface Player {
  id: string;
  name: string;
  status: "Active" | "Inactive" | "Eliminated";
}
interface Result {
  id: string;
  playerId: string;
  playerName: string;
  money: number;
  notes?: string;
  officer: string;
  createdAt: number;
}

export default function Round2ManageMoneyPage() {
  const { user, admin } = useAuth();
  const officer = user?.displayName || user?.email || "Unknown";
  const [players, setPlayers] = useState<Player[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [showRoundSettings, setShowRoundSettings] = useState<boolean>(false);
  const [form, setForm] = useState<{
    playerId: string;
    money: string;
    notes: string;
  }>({ playerId: "", money: "", notes: "" });

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
    })();
    (async () => {
      try {
        const list = await listRound2MoneyResults();
        setResults(list);
      } catch {}
    })();
  }, []);

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => b.money - a.money);
  }, [results]);

  function resetForm() {
    setForm({ playerId: "", money: "", notes: "" });
  }

  async function submitResult(e: React.FormEvent) {
    e.preventDefault();
    const moneyNum = Number(form.money);
    if (!form.playerId || !isFinite(moneyNum)) return;
    const p = players.find((x) => x.id === form.playerId);
    try {
      const id = await addRound2MoneyResult({
        officer,
        playerId: form.playerId,
        playerName: p?.name || form.playerId,
        money: moneyNum,
        notes: form.notes || undefined,
      });
      const list = await listRound2MoneyResults();
      setResults(list);
      resetForm();
    } catch (e: any) {
      alert(e?.message || "Failed to record result");
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
        Round 2 — Money Round (Admin)
      </h1>

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold text-foreground">
            Record Money Results
          </h2>
          <form onSubmit={submitResult} className="mt-3">
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
                    Player
                  </label>
                  <select
                    className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={form.playerId}
                    onChange={(e) =>
                      setForm({ ...form, playerId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select player…</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
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

      <section className="mb-4 mt-4">
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
    </div>
  );
}

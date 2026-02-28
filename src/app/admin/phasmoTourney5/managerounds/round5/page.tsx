"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import GameSettingsAdminEditor from "../../../../../components/tourney/GameSettingsAdminEditor";
import {
  computeRound5Marks,
  tourney5ExportRun,
} from "@/lib/services/phasmoTourney5";
import EliminatorCard from "@/components/tourney/EliminatorCard";
import RecordedRunsTable from "@/components/tourney/RecordedRunsTable";

interface Player {
  id: string;
  name: string;
  status: "Active" | "Inactive" | "Eliminated";
}

export default function Round5AdminPage() {
  const { user, admin } = useAuth();
  const officer = user?.displayName || user?.email || "Unknown";
  const [players, setPlayers] = useState<Player[]>([]);
  const [showRoundSettings, setShowRoundSettings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [form, setForm] = useState({
    playerId: "",
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
    })();
  }, []);

  function resetForm() {
    setForm({
      playerId: "",
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
  }

  async function submitRun(e: React.FormEvent) {
    e.preventDefault();
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
      await tourney5ExportRun({
        officer,
        playerId: form.playerId,
        roundId: "round5",
        notes: form.notes,
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
      resetForm();
    } catch (e: any) {
      alert(e?.message || "Failed to record run");
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
        Round 5 — Tourney 5 Special (Admin)
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
        {showRoundSettings && <GameSettingsAdminEditor roundId="round5" />}
      </section>

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold text-foreground">
            Record Run Details
          </h2>
          {message && (
            <div
              className={cn(
                "rounded-xl border p-4 mt-2 flex items-center justify-between",
                message.type === "success"
                  ? "border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 text-green-800 dark:text-green-200"
                  : "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 text-red-800 dark:text-red-200",
              )}
            >
              <span>{message.text}</span>
              <button
                type="button"
                onClick={() => setMessage(null)}
                className="ml-2 text-current opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}
          <form onSubmit={submitRun} className="mt-3">
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
                    Notes
                  </label>
                  <textarea
                    rows={4}
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
                  { key: "ghostPicture", label: "Ghost picture" },
                  { key: "bonePicture", label: "Bone picture" },
                  { key: "cursedItemUse", label: "Cursed item use" },
                  { key: "objective1", label: "Objective 1" },
                  { key: "objective2", label: "Objective 2" },
                  { key: "objective3", label: "Objective 3" },
                  { key: "perfectGame", label: "Perfect game" },
                  { key: "survived", label: "Survived" },
                  { key: "correctGhostType", label: "Correct ghost type" },
                ].map((t) => (
                  <label
                    key={t.key}
                    className="relative inline-flex items-center cursor-pointer gap-2"
                  >
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      id={`toggle-${t.key}`}
                      checked={(form as any)[t.key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [t.key]: e.currentTarget.checked,
                        } as any)
                      }
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    <span className="text-sm text-foreground">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-400 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                onClick={resetForm}
                disabled={submitting}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      <section className="mt-4">
        <RecordedRunsTable roundId="round5" showAdminControls={true} />
      </section>

      <section className="mt-4">
        <EliminatorCard />
      </section>
    </div>
  );
}

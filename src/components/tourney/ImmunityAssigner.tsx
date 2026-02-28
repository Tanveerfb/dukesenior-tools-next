"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  immune: boolean;
  status: "Active" | "Inactive" | "Eliminated";
}

export default function ImmunityAssigner({
  roundLabel,
}: {
  roundLabel?: string;
}) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);

  async function loadPlayers() {
    try {
      const res = await fetch("/api/admin/phasmoTourney5/players");
      const json = await res.json();
      const list = Array.isArray(json)
        ? json
            .filter((p: any) => p.status !== "Eliminated")
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              immune: !!p.immune,
              status: p.status,
            }))
        : [];
      setPlayers(list);
    } catch (_e) {
      setMessage("Failed to load players");
    }
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  async function assignImmunity(val: boolean) {
    if (!selected) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/phasmoTourney5/players/${selected}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ immune: val }),
      });
      if (!res.ok) throw new Error("Failed to update immunity");
      setMessage(val ? "Immunity assigned." : "Immunity removed.");
      await loadPlayers();
    } catch (e: any) {
      setMessage(e?.message || "Failed to update immunity");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-foreground">
          Immunity Assigner{roundLabel ? ` — ${roundLabel}` : ""}
        </h2>
        <div className="flex flex-row flex-wrap items-end gap-3 mt-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Active Player
            </label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select player…</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.immune ? "(immune)" : ""}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => assignImmunity(true)}
            disabled={!selected}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              "bg-primary-500 text-white hover:bg-primary-600",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            Assign Immunity
          </button>
          <button
            type="button"
            onClick={() => assignImmunity(false)}
            disabled={!selected}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              "border border-red-500 text-red-500 hover:bg-red-500/10",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            Remove Immunity
          </button>
        </div>
        <div className="mt-3 rounded-lg border border-border dark:border-border-dark bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-foreground-secondary">
          Immunity lasts one turn (until end of next elimination).
        </div>
        {message && (
          <div className="mt-2 text-sm text-foreground-secondary">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

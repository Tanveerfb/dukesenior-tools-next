"use client";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { FiChevronDown } from "react-icons/fi";
import GameSettingsAdminEditor from "./GameSettingsAdminEditor";

export default function MatchSettingsEditor({
  matchNumber,
}: {
  matchNumber: number;
}) {
  const roundId = `round4-match-${matchNumber}`;
  const [players, setPlayers] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [p1, setP1] = useState<string>("");
  const [p2, setP2] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/phasmoTourney5/players");
        const json = await res.json();
        const list = Array.isArray(json)
          ? json
              .filter((p: any) => p.status !== "Eliminated")
              .map((p: any) => ({ id: p.id, name: p.name }))
          : [];
        setPlayers(list);
      } catch {}
    })();
  }, []);

  const title = useMemo(() => {
    const p1n = players.find((x) => x.id === p1)?.name || "Player 1";
    const p2n = players.find((x) => x.id === p2)?.name || "Player 2";
    return `Match ${matchNumber}: ${p1n} vs ${p2n}`;
  }, [players, p1, p2, matchNumber]);

  return (
    <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-foreground font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-t-xl"
      >
        <span>{title}</span>
        <FiChevronDown
          className={cn("w-5 h-5 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="flex gap-3 flex-wrap mb-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Player 1
              </label>
              <select
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                className="rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select player…</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Player 2
              </label>
              <select
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                className="rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          <GameSettingsAdminEditor roundId={roundId} />
        </div>
      )}
    </div>
  );
}

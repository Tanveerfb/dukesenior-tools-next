"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { listEliminatorSessions } from "@/lib/services/phasmoTourney5";

interface Player {
  id: string;
  name: string;
}

interface EliminatorSession {
  id: string;
  challengerId: string;
  defenderId: string;
  winnerId: string;
  officer: string;
  createdAt: number;
  playerCount?: number | null;
}

export default function Tourney5EliminatorSessionsDataPage() {
  const [sessions, setSessions] = useState<EliminatorSession[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [sessionsData, playersRes] = await Promise.all([
          listEliminatorSessions(),
          fetch("/api/admin/phasmoTourney5/players"),
        ]);
        const playersData = await playersRes.json();
        setSessions(sessionsData);
        setPlayers(Array.isArray(playersData) ? playersData : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function getPlayerName(playerId: string): string {
    return players.find((p) => p.id === playerId)?.name || playerId;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-lg font-semibold mb-3">
          Phasmo Tourney 5 — Eliminator Sessions Data
        </h1>
        <div className="text-center py-10">
          <svg
            className="animate-spin h-8 w-8 text-primary-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-lg font-semibold mb-3">
          Phasmo Tourney 5 — Eliminator Sessions Data
        </h1>
        <div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-800 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  // Sort by most recent first
  const sortedSessions = [...sessions].sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-lg font-semibold mb-3">
        Phasmo Tourney 5 — Eliminator Sessions Data
      </h1>
      <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm">
        <div className="p-4">
          <h2 className="text-base font-semibold mb-3">
            Challenge History ({sessions.length} total)
          </h2>
          {sessions.length === 0 ? (
            <div className="rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
              No eliminator sessions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-border-dark">
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Challenger</th>
                    <th className="px-3 py-2 text-left">Defender</th>
                    <th className="px-3 py-2 text-left">Winner</th>
                    <th className="px-3 py-2 text-left">Players Remaining</th>
                    <th className="px-3 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSessions.map((session, idx) => (
                    <tr
                      key={session.id}
                      className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-3 py-2">
                        {sortedSessions.length - idx}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            session.winnerId === session.challengerId &&
                              "font-semibold text-green-600 dark:text-green-400",
                          )}
                        >
                          {getPlayerName(session.challengerId)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            session.winnerId === session.defenderId &&
                              "font-semibold text-green-600 dark:text-green-400",
                          )}
                        >
                          {getPlayerName(session.defenderId)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-green-600 text-white">
                          {getPlayerName(session.winnerId)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {session.playerCount !== null &&
                        session.playerCount !== undefined
                          ? session.playerCount
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-foreground/50 text-sm">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
}

interface Session {
  id: string;
  name: string;
  type: "vote-out" | "pick-ally";
  anonymous: boolean;
  closed: boolean;
  createdAt: number;
  closedAt?: number;
}

interface Vote {
  id: string;
  sessionId: string;
  voterUid: string;
  voterName: string;
  choicePlayerId: string;
  createdAt: number;
}

export default function Tourney5VoteSessionsDataPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [votesBySession, setVotesBySession] = useState<Record<string, Vote[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [playersRes, sessionsRes] = await Promise.all([
          fetch("/api/admin/phasmoTourney5/players"),
          fetch("/api/admin/phasmoTourney5/votesessions"),
        ]);
        const p = await playersRes.json();
        const s = await sessionsRes.json();
        setPlayers(Array.isArray(p) ? p : []);
        const sessionsList = Array.isArray(s) ? s : [];
        setSessions(sessionsList);

        // Load votes for all closed sessions
        const closedSessions = sessionsList.filter(
          (sess: Session) => sess.closed,
        );
        const votesData: Record<string, Vote[]> = {};
        await Promise.all(
          closedSessions.map(async (sess: Session) => {
            try {
              const res = await fetch(
                `/api/phasmoTourney5/votesessions/${sess.id}/vote`,
              );
              const v = await res.json();
              votesData[sess.id] = Array.isArray(v) ? v : [];
            } catch {
              votesData[sess.id] = [];
            }
          }),
        );
        setVotesBySession(votesData);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function getPlayerName(playerId: string): string {
    return players.find((p) => p.id === playerId)?.name || playerId;
  }

  function computeTally(
    votes: Vote[],
  ): Array<{ playerId: string; count: number }> {
    const tally: Record<string, number> = {};
    for (const v of votes) {
      tally[v.choicePlayerId] = (tally[v.choicePlayerId] || 0) + 1;
    }
    return Object.entries(tally)
      .map(([playerId, count]) => ({ playerId, count }))
      .sort((a, b) => b.count - a.count);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-lg font-semibold mb-3 text-foreground">
          Phasmo Tourney 5 — Vote Sessions Data
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
        <h1 className="text-lg font-semibold mb-3 text-foreground">
          Phasmo Tourney 5 — Vote Sessions Data
        </h1>
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 p-3 text-red-800 dark:text-red-200">
          {error}
        </div>
      </div>
    );
  }

  const closedSessions = sessions
    .filter((s) => s.closed)
    .sort((a, b) => (b.closedAt || b.createdAt) - (a.closedAt || a.createdAt));

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-lg font-semibold mb-3 text-foreground">
        Phasmo Tourney 5 — Vote Sessions Data
      </h1>
      {closedSessions.length === 0 ? (
        <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 p-3 text-blue-800 dark:text-blue-200">
          No closed vote sessions yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {closedSessions.map((session) => {
            const votes = votesBySession[session.id] || [];
            const tally = computeTally(votes);
            const topChoice = tally[0];
            return (
              <div
                key={session.id}
                className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm p-4"
              >
                <h2 className="text-base font-semibold mb-2 text-foreground">
                  {session.name}
                </h2>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span
                    className={cn(
                      "rounded-full text-xs font-medium px-2.5 py-0.5",
                      session.type === "vote-out"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                    )}
                  >
                    {session.type === "vote-out" ? "Vote Out" : "Pick Ally"}
                  </span>
                  <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {session.anonymous ? "Anonymous" : "Public"}
                  </span>
                  <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {votes.length} votes
                  </span>
                </div>
                {votes.length === 0 ? (
                  <div className="rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 p-3 text-gray-700 dark:text-gray-300 text-sm">
                    No votes recorded.
                  </div>
                ) : (
                  <>
                    {topChoice && (
                      <div className="mb-3 p-3 border border-border dark:border-border-dark rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="font-semibold text-sm text-foreground">
                          {session.type === "vote-out"
                            ? "Voted Out:"
                            : "Most Selected:"}
                        </div>
                        <div className="text-3xl font-bold text-primary-500">
                          {getPlayerName(topChoice.playerId)}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {topChoice.count} vote
                          {topChoice.count !== 1 ? "s" : ""}
                        </div>
                      </div>
                    )}
                    <h3 className="text-sm font-semibold mb-2 text-foreground">
                      Vote Breakdown
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-border dark:border-border-dark">
                            <th className="py-2 pr-4 font-semibold text-foreground">
                              Player
                            </th>
                            <th className="py-2 pr-4 font-semibold text-foreground">
                              Votes
                            </th>
                            <th className="py-2 font-semibold text-foreground">
                              Percentage
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {tally.map(({ playerId, count }) => (
                            <tr
                              key={playerId}
                              className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            >
                              <td className="py-2 pr-4 font-semibold text-foreground">
                                {getPlayerName(playerId)}
                              </td>
                              <td className="py-2 pr-4 text-foreground">
                                {count}
                              </td>
                              <td className="py-2 text-muted-foreground">
                                {((count / votes.length) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
                <div className="text-muted-foreground text-sm mt-2">
                  Closed on{" "}
                  {new Date(
                    session.closedAt || session.createdAt,
                  ).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

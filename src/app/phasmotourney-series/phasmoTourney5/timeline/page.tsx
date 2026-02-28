"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { listEliminatorSessions } from "@/lib/services/phasmoTourney5";

interface Player {
  id: string;
  name: string;
  status: "Active" | "Inactive" | "Eliminated";
  immune: boolean;
}

interface Session {
  id: string;
  name: string;
  type: "vote-out" | "pick-ally";
  closed: boolean;
  createdAt: number;
  closedAt?: number;
}

interface Vote {
  choicePlayerId: string;
}

interface EliminatorSession {
  id: string;
  challengerId: string;
  defenderId: string;
  winnerId: string;
  createdAt: number;
}

interface RoundEvent {
  type: "eliminator" | "vote" | "immunity";
  timestamp: number;
  description: string;
  details?: any;
}

function Spinner() {
  return (
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
  );
}

export default function Tourney5TimelinePage() {
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [eliminatorSessions, setEliminatorSessions] = useState<
    EliminatorSession[]
  >([]);
  const [votesBySession, setVotesBySession] = useState<Record<string, Vote[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rounds = [1, 2, 3, 4, 5, 6, 7];

  useEffect(() => {
    (async () => {
      try {
        const [playersRes, sessionsRes, eliminatorData] = await Promise.all([
          fetch("/api/admin/phasmoTourney5/players"),
          fetch("/api/admin/phasmoTourney5/votesessions"),
          listEliminatorSessions(),
        ]);
        const p = await playersRes.json();
        const s = await sessionsRes.json();

        setPlayers(Array.isArray(p) ? p : []);
        const sessionsList = Array.isArray(s) ? s : [];
        setSessions(sessionsList);
        setEliminatorSessions(eliminatorData);

        // Load votes for closed sessions
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

  function getTopVotedPlayer(votes: Vote[]): string | null {
    if (votes.length === 0) return null;
    const tally: Record<string, number> = {};
    for (const v of votes) {
      tally[v.choicePlayerId] = (tally[v.choicePlayerId] || 0) + 1;
    }
    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || null;
  }

  function getRoundEvents(round: number): RoundEvent[] {
    const events: RoundEvent[] = [];

    // TODO: Store round info in eliminator sessions for proper filtering
    // Currently showing all eliminator events since round data not tracked
    eliminatorSessions.forEach((session) => {
      events.push({
        type: "eliminator",
        timestamp: session.createdAt,
        description: `${getPlayerName(session.challengerId)} challenged ${getPlayerName(session.defenderId)}`,
        details: {
          winner: getPlayerName(session.winnerId),
          challenger: getPlayerName(session.challengerId),
          defender: getPlayerName(session.defenderId),
        },
      });
    });

    // Add vote events
    sessions
      .filter((s) => s.closed)
      .forEach((session) => {
        const votes = votesBySession[session.id] || [];
        const topPlayer = getTopVotedPlayer(votes);
        if (session.type === "vote-out" && topPlayer) {
          events.push({
            type: "vote",
            timestamp: session.closedAt || session.createdAt,
            description: `${getPlayerName(topPlayer)} was voted out`,
            details: {
              sessionName: session.name,
              totalVotes: votes.length,
            },
          });
        } else if (session.type === "pick-ally") {
          events.push({
            type: "vote",
            timestamp: session.closedAt || session.createdAt,
            description: `Ally selection: ${session.name}`,
            details: {
              sessionName: session.name,
              totalVotes: votes.length,
            },
          });
        }
      });

    // Sort by timestamp
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-lg font-semibold mb-3">
          Phasmo Tourney 5 — Timeline
        </h1>
        <div className="text-center py-10">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-lg font-semibold mb-3">
          Phasmo Tourney 5 — Timeline
        </h1>
        <div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-800 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  const roundEvents = getRoundEvents(selectedRound);
  const immunePlayers = players.filter(
    (p) => p.immune && p.status === "Active",
  );

  const eventBadgeStyles: Record<string, string> = {
    eliminator: "bg-red-600 text-white",
    vote: "bg-yellow-500 text-gray-900",
    immunity: "bg-cyan-500 text-gray-900",
  };

  const eventLabels: Record<string, string> = {
    eliminator: "Eliminator Challenge",
    vote: "Vote Session",
    immunity: "Immunity",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-lg font-semibold mb-3">
        Phasmo Tourney 5 — Timeline
      </h1>

      {/* Select Round Card */}
      <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold mb-3">Select Round</h2>
          <div className="flex flex-wrap">
            {rounds.map((round) => (
              <button
                key={round}
                onClick={() => setSelectedRound(round)}
                className={cn(
                  "px-4 py-2 text-sm font-medium border border-primary-500 transition-colors",
                  "first:rounded-l-lg last:rounded-r-lg",
                  selectedRound === round
                    ? "bg-primary-500 text-white"
                    : "bg-transparent text-primary-500 hover:bg-primary-500/10",
                )}
              >
                Round {round}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Immune Players Card */}
      <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold mb-3">
            Current Immune Players
          </h2>
          {immunePlayers.length === 0 ? (
            <div className="rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
              No players are currently immune.
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {immunePlayers.map((player) => (
                <span
                  key={player.id}
                  className="rounded-full text-xs font-medium px-3 py-1.5 bg-yellow-500 text-gray-900"
                >
                  {player.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Round Events Card */}
      <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm">
        <div className="p-4">
          <h2 className="text-base font-semibold mb-3">
            Round {selectedRound} Events
          </h2>
          {roundEvents.length === 0 ? (
            <div className="rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
              No events recorded for Round {selectedRound} yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {roundEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border dark:border-border-dark p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={cn(
                        "rounded-full text-xs font-medium px-2.5 py-0.5",
                        eventBadgeStyles[event.type],
                      )}
                    >
                      {eventLabels[event.type]}
                    </span>
                    <span className="text-foreground/50 text-sm">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mb-1">{event.description}</div>
                  {event.details && event.type === "eliminator" && (
                    <div className="text-sm text-foreground/50">
                      Winner:{" "}
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {event.details.winner}
                      </span>
                    </div>
                  )}
                  {event.details && event.type === "vote" && (
                    <div className="text-sm text-foreground/50">
                      Total votes: {event.details.totalVotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

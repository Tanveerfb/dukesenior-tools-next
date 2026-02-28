"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface CandidateCount {
  candidateId: string;
  votes: number;
}
interface SessionTally {
  sessionId: string;
  counts: CandidateCount[];
  totalVotes: number;
  open: boolean;
  round: number;
  revealOrder?: string[]; // optional if extended in session doc fetch
  revealed?: boolean;
}

export default function VotingResults({ round }: { round: number }) {
  const { admin } = useAuth();
  const [sessions, setSessions] = useState<SessionTally[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const listRes = await fetch(`/api/votes/list?round=${round}`);
      if (!listRes.ok) throw new Error(`List failed ${listRes.status}`);
      const raw = await listRes.json();
      const tallies: SessionTally[] = [];
      for (const s of raw) {
        const tRes = await fetch(`/api/votes/session/${s.id}`);
        if (tRes.ok) {
          const t = await tRes.json();
          tallies.push({ ...t, sessionId: s.id, revealed: s.revealed });
        }
      }
      setSessions(
        tallies.sort(
          (a, b) => b.round - a.round || b.totalVotes - a.totalVotes,
        ),
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  async function persistReveal(sessionId: string) {
    try {
      const res = await fetch(`/api/votes/reveal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, revealed: true }),
      });
      if (!res.ok) throw new Error(`Reveal failed ${res.status}`);
      setRevealed((r) => ({ ...r, [sessionId]: true }));
      // also update local session revealed flag
      setSessions((ss) =>
        ss.map((s) =>
          s.sessionId === sessionId ? { ...s, revealed: true } : s,
        ),
      );
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div>
      {error && (
        <div
          className={cn(
            "rounded border border-red-400 bg-red-50 px-3 py-1 text-sm text-red-700",
            "dark:border-red-600 dark:bg-red-950 dark:text-red-300",
          )}
        >
          {error}
        </div>
      )}
      {loading && (
        <div className="flex items-center gap-2 text-foreground">
          <svg
            className="h-4 w-4 animate-spin"
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
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          Loading results
        </div>
      )}
      {!loading && sessions.length === 0 && (
        <p className="mb-0 text-sm text-foreground-secondary">
          No voting sessions yet.
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {sessions.map((session) => {
          const leaderVotes = Math.max(
            0,
            ...session.counts.map((c) => c.votes),
          );
          const isRevealed = revealed[session.sessionId] ?? !!session.revealed;
          return (
            <div
              key={session.sessionId}
              className={cn(
                "h-full rounded-xl border bg-card shadow-sm",
                "border-border dark:border-border-dark dark:bg-card-dark",
              )}
            >
              <div className="p-4 text-sm">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex flex-wrap items-center gap-1">
                    <strong className="text-foreground">
                      Session {session.sessionId.slice(0, 6)}
                    </strong>
                    {session.open ? (
                      <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
                        Open
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-500 px-2 py-0.5 text-xs font-medium text-white">
                        Closed
                      </span>
                    )}
                    <span className="ml-1 rounded-full bg-sky-500 px-2 py-0.5 text-xs font-medium text-white">
                      Round {session.round}
                    </span>
                  </div>
                  {admin && !isRevealed && (
                    <button
                      type="button"
                      onClick={() => persistReveal(session.sessionId)}
                      className={cn(
                        "rounded border border-primary-500 px-2 py-1 text-xs font-medium text-primary-500",
                        "hover:bg-primary-500 hover:text-white",
                      )}
                    >
                      Reveal (persist)
                    </button>
                  )}
                </div>
                {!isRevealed && (
                  <p className="mb-2 text-foreground-secondary">
                    Results hidden until revealed by admin.
                  </p>
                )}
                {isRevealed && (
                  <ul className="mb-2 list-disc pl-5">
                    {session.counts.map((c) => (
                      <li
                        key={c.candidateId}
                        className={cn(
                          "text-foreground",
                          c.votes === leaderVotes &&
                            leaderVotes > 0 &&
                            "font-semibold",
                        )}
                      >
                        {c.candidateId}: {c.votes} vote
                        {c.votes !== 1 ? "s" : ""}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mb-0 text-foreground-secondary">
                  Total votes: {session.totalVotes}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  immune: boolean;
  status: "Active" | "Inactive" | "Eliminated";
}
interface Session {
  id: string;
  name: string;
  type: "vote-out" | "pick-ally";
  anonymous: boolean;
  subjectPlayerId?: string;
  selectionPool: string;
  closed: boolean;
  createdAt: number;
  closedAt?: number;
  link: string;
}
interface Vote {
  id: string;
  sessionId: string;
  voterUid: string;
  voterName: string;
  choicePlayerId: string;
  createdAt: number;
}

export default function ManageVoteSessionsPage() {
  const { admin, user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [votesBySession, setVotesBySession] = useState<Record<string, Vote[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<{
    name: string;
    type: "vote-out" | "pick-ally";
  }>({ name: "", type: "vote-out" });

  const [revealSession, setRevealSession] = useState<Session | null>(null);
  const [revealIndex, setRevealIndex] = useState(0);

  useEffect(() => {
    if (!admin) return;
    (async () => {
      setLoading(true);
      try {
        const [playersRes, sessionsRes] = await Promise.all([
          fetch("/api/admin/phasmoTourney5/players"),
          fetch("/api/admin/phasmoTourney5/votesessions"),
        ]);
        const p = await playersRes.json();
        const s = await sessionsRes.json();
        setPlayers(Array.isArray(p) ? p : []);
        setSessions(Array.isArray(s) ? s : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [admin]);

  // Poll votes for live counts
  useEffect(() => {
    if (!admin) return;
    const interval = setInterval(async () => {
      try {
        const active = sessions.filter((s) => !s.closed);
        const updates: Record<string, Vote[]> = {};
        await Promise.all(
          active.map(async (s) => {
            const res = await fetch(
              `/api/phasmoTourney5/votesessions/${s.id}/vote`
            );
            const v = await res.json();
            updates[s.id] = Array.isArray(v) ? v : [];
          })
        );
        setVotesBySession((prev) => ({ ...prev, ...updates }));
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [admin, sessions]);

  if (!admin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-4 py-3">
          Admin access required.{" "}
          <Link href="/login" className="underline font-semibold">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  const activePlayers = players.filter((p) => p.status === "Active");
  const nonImmuneActive = activePlayers.filter((p) => !p.immune);

  async function handleCreateSession(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError("Name is required");
    try {
      const res = await fetch("/api/admin/phasmoTourney5/votesessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
        }),
      });
      if (!res.ok) throw new Error(`Failed to create: ${res.status}`);
      const created: Session = await res.json();
      setSessions((prev) => [created, ...prev]);
      setForm({ name: "", type: "vote-out" });
    } catch (e: any) {
      setError(e?.message || "Failed to create session");
    }
  }

  async function handleCloseSession(s: Session) {
    try {
      const res = await fetch(
        `/api/admin/phasmoTourney5/votesessions/${s.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ closed: true }),
        }
      );
      if (!res.ok) throw new Error(`Failed to close: ${res.status}`);
      const updated: Session = await res.json();
      setSessions((prev) =>
        prev.map((x) => (x.id === updated.id ? updated : x))
      );
    } catch (e: any) {
      setError(e?.message || "Failed to close session");
    }
  }

  function startReveal(s: Session) {
    setRevealSession(s);
    setRevealIndex(0);
    // load votes immediately
    (async () => {
      const res = await fetch(`/api/phasmoTourney5/votesessions/${s.id}/vote`);
      const vs = await res.json();
      setVotesBySession((prev) => ({
        ...prev,
        [s.id]: Array.isArray(vs) ? vs : [],
      }));
    })();
  }

  const revealVotes = revealSession
    ? votesBySession[revealSession.id] || []
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold mb-4">Manage Vote Sessions</h1>

      {/* Admin status banner */}
      <div className="mb-3 rounded-xl border border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <strong>Admin access confirmed</strong>{" "}
            <span className="ml-2">
              {user?.email ? (
                <>
                  Signed in as{" "}
                  <span className="inline-flex rounded-full text-xs font-medium px-2.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {user.email}
                  </span>
                </>
              ) : (
                "Not signed in"
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold">Create New Session</h2>
          <form onSubmit={handleCreateSession} className="mt-3">
            {error && (
              <div className="mb-3 flex items-start justify-between rounded-xl border border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300 px-4 py-3">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="ml-4 font-bold hover:opacity-70"></button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                  <input
                    className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-foreground mb-1">Type *</label>
                  <select
                    className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value as "vote-out" | "pick-ally",
                      })
                    }
                  >
                    <option value="vote-out">Vote Out</option>
                    <option value="pick-ally">Pick Ally</option>
                  </select>
                </div>
                <div className="mb-3">
                  <div className="text-gray-500 text-xs">
                    {form.type === "vote-out"
                      ? "Session is anonymous by rule."
                      : "Session is non-anonymous by rule."}
                  </div>
                </div>
              </div>
              <div>
                <div className="p-2 border border-border dark:border-border-dark rounded-lg">
                  <div className="text-xs text-gray-500 mb-2">
                    {form.type === "vote-out"
                      ? "Voters choose one from Non-Immune Active players."
                      : "Voters choose one ally from all Active players."}
                  </div>
                  <div className="text-xs">
                    Pool size:{" "}
                    {form.type === "vote-out"
                      ? nonImmuneActive.length
                      : activePlayers.length}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Create Session
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold">Active Sessions</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border dark:border-border-dark">
                  <th className="text-left py-2 px-3 font-medium">Name</th>
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-left py-2 px-3 font-medium">Anonymous</th>
                  <th className="text-left py-2 px-3 font-medium">Votes</th>
                  <th className="text-left py-2 px-3 font-medium">Link</th>
                  <th className="text-left py-2 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions
                  .filter((s) => !s.closed)
                  .map((s) => (
                    <tr key={s.id} className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-2 px-3">{s.name}</td>
                      <td className="py-2 px-3">{s.type === "vote-out" ? "Vote Out" : "Pick Ally"}</td>
                      <td className="py-2 px-3">{s.anonymous ? "Yes" : "No"}</td>
                      <td className="py-2 px-3">{(votesBySession[s.id] || []).length}</td>
                      <td className="py-2 px-3">
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{s.link}</code>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => navigator.clipboard.writeText(s.link)}
                            className="rounded-lg border border-gray-400 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            Copy Link
                          </button>
                          <button
                            onClick={() => handleCloseSession(s)}
                            className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {sessions.filter((s) => !s.closed).length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-2 px-3 text-gray-500">
                      No active sessions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold">Past Sessions</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border dark:border-border-dark">
                  <th className="text-left py-2 px-3 font-medium">Name</th>
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-left py-2 px-3 font-medium">Closed</th>
                  <th className="text-left py-2 px-3 font-medium">Votes</th>
                  <th className="text-left py-2 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions
                  .filter((s) => s.closed)
                  .map((s) => (
                    <tr key={s.id} className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-2 px-3">{s.name}</td>
                      <td className="py-2 px-3">{s.type === "vote-out" ? "Vote Out" : "Pick Ally"}</td>
                      <td className="py-2 px-3">
                        {s.closedAt ? new Date(s.closedAt).toLocaleString() : "-"}
                      </td>
                      <td className="py-2 px-3">{(votesBySession[s.id] || []).length}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => startReveal(s)}
                            className="rounded-lg border border-blue-600 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            Reveal
                          </button>
                          <button
                            onClick={() => navigator.clipboard.writeText(s.link)}
                            className="rounded-lg border border-gray-400 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            Copy Link
                          </button>
                          <button
                            className="rounded-lg border border-red-600 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            onClick={async () => {
                              const confirmed = window.confirm(
                                `Delete session "${s.name}"? This cannot be undone.`
                              );
                              if (!confirmed) return;
                              try {
                                const res = await fetch(
                                  `/api/admin/phasmoTourney5/votesessions/${s.id}`,
                                  { method: "DELETE" }
                                );
                                if (!res.ok)
                                  throw new Error(`Delete failed: ${res.status}`);
                                setSessions((prev) =>
                                  prev.filter((x) => x.id !== s.id)
                                );
                              } catch (e: any) {
                                setError(
                                  e?.message || "Failed to delete session"
                                );
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {sessions.filter((s) => s.closed).length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-2 px-3 text-gray-500">
                      No past sessions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reveal Modal */}
      {!!revealSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setRevealSession(null)} />
          <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-card dark:bg-card-dark border border-border dark:border-border-dark shadow-xl mx-4">
            <div className="flex items-center justify-between border-b border-border dark:border-border-dark p-4">
              <h3 className="text-lg font-semibold">Reveal Votes  {revealSession?.name}</h3>
              <button onClick={() => setRevealSession(null)} className="text-gray-400 hover:text-gray-600 text-xl"></button>
            </div>
            <div className="p-4">
              {revealSession && (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 border border-border dark:border-border-dark rounded-lg w-full text-center">
                    {revealVotes.length === 0 ? (
                      <div className="text-gray-500">No votes yet.</div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <div className="font-semibold">
                            {revealSession.type === "vote-out"
                              ? "Voted Out:"
                              : "Picked Ally:"}
                          </div>
                          {!revealSession.anonymous && (
                            <div className="text-gray-500 text-xs">
                              Voter: {revealVotes[revealIndex]?.voterName}
                            </div>
                          )}
                        </div>
                        <div className="text-3xl font-light my-3">
                          {(() => {
                            const pid = revealVotes[revealIndex]?.choicePlayerId;
                            const p = players.find((x) => x.id === pid);
                            return p?.name || pid || "";
                          })()}
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() =>
                              setRevealIndex((i) => Math.max(0, i - 1))
                            }
                            disabled={revealIndex <= 0}
                            className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Prev
                          </button>
                          <span className="inline-flex rounded-full text-xs font-medium px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {revealIndex + 1} / {revealVotes.length}
                          </span>
                          <button
                            onClick={() =>
                              setRevealIndex((i) =>
                                Math.min(revealVotes.length - 1, i + 1)
                              )
                            }
                            disabled={revealIndex >= revealVotes.length - 1}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="w-full">
                    {(() => {
                      // Compute tally and top entry by votes
                      const tally: Record<string, number> = {};
                      for (const v of revealVotes) {
                        tally[v.choicePlayerId] =
                          (tally[v.choicePlayerId] || 0) + 1;
                      }
                      const sortedByVotes = Object.entries(tally).sort(
                        (a, b) => b[1] - a[1]
                      );
                      const topChoiceId = sortedByVotes[0]?.[0];
                      const topChoiceName =
                        players.find((p) => p.id === topChoiceId)?.name ||
                        topChoiceId;
                      return (
                        <div className="mb-2">
                          {revealSession.type === "vote-out" &&
                            revealVotes.length > 0 && (
                              <span className="inline-flex rounded-full text-xs font-medium px-2.5 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 mr-2">
                                Voted Out
                              </span>
                            )}
                          <span className="font-semibold">Top:</span>{" "}
                          <span className="text-red-600 font-semibold">
                            {topChoiceName || ""}
                          </span>{" "}
                          <span className="text-gray-500">
                            ({sortedByVotes[0]?.[1] || 0} votes)
                          </span>
                        </div>
                      );
                    })()}
                    <h3 className="text-sm font-semibold">Recorded Entries</h3>
                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border dark:border-border-dark">
                            {!revealSession.anonymous && <th className="text-left py-2 px-3 font-medium">Voter</th>}
                            <th className="text-left py-2 px-3 font-medium">
                              {revealSession.type === "pick-ally"
                                ? "Selection"
                                : "Choice"}
                            </th>
                            <th className="text-left py-2 px-3 font-medium">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {revealVotes
                            .slice()
                            .sort((a, b) => b.createdAt - a.createdAt)
                            .map((v) => (
                              <tr key={v.id} className="border-b border-border/50 dark:border-border-dark/50">
                                {!revealSession.anonymous && (
                                  <td className="py-2 px-3 text-gray-500 text-xs">{v.voterName}</td>
                                )}
                                <td className="py-2 px-3">
                                  {revealSession.type === "pick-ally" ? (
                                    <span>
                                      <span className="text-blue-600 font-semibold">
                                        {v.voterName}
                                      </span>{" "}
                                      picks{" "}
                                      <span className="text-green-600 font-semibold">
                                        {players.find(
                                          (p) => p.id === v.choicePlayerId
                                        )?.name || v.choicePlayerId}
                                      </span>
                                    </span>
                                  ) : (
                                    players.find((p) => p.id === v.choicePlayerId)
                                      ?.name || v.choicePlayerId
                                  )}
                                </td>
                                <td className="py-2 px-3 text-gray-500 text-xs">
                                  {new Date(v.createdAt).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          {revealVotes.length === 0 && (
                            <tr>
                              <td
                                colSpan={revealSession.anonymous ? 2 : 3}
                                className="py-2 px-3 text-gray-500"
                              >
                                No entries.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-border dark:border-border-dark p-4">
              <button
                onClick={() => setRevealSession(null)}
                className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
  closed: boolean;
}

export default function VoteSessionPage() {
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [choice, setChoice] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const id = params?.id as string;
    if (!id || !user) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [sessionRes, playersRes] = await Promise.all([
          fetch(`/api/admin/phasmoTourney5/votesessions/${id}`),
          fetch(`/api/admin/phasmoTourney5/players`),
        ]);
        const s = await sessionRes.json();
        const p = await playersRes.json();
        if (!sessionRes.ok) throw new Error(s?.error || "Session fetch failed");
        setSession(s);
        setPlayers(Array.isArray(p) ? p : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [params?.id, user]);

  const active = useMemo(
    () => players.filter((p) => p.status === "Active"),
    [players],
  );
  const nonImmuneActive = useMemo(
    () => active.filter((p) => !p.immune),
    [active],
  );
  const pool = useMemo(
    () => (session?.type === "vote-out" ? nonImmuneActive : active),
    [session?.type, active, nonImmuneActive],
  );

  // Require login before using the page
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 p-3 text-yellow-800 dark:text-yellow-200">
          Login required to vote.{" "}
          <Link href="/login" className="underline font-medium">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  async function submitVote() {
    if (!session) return;
    if (!choice) return setError("Please select a player");
    if (session.closed) return setError("Voting closed");
    if (!user?.uid) return setError("Login required");
    const confirmed = window.confirm(
      `Confirm your vote for ${
        players.find((p) => p.id === choice)?.name || choice
      }?`,
    );
    if (!confirmed) return;
    try {
      const res = await fetch(
        `/api/phasmoTourney5/votesessions/${session.id}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            choicePlayerId: choice,
            voterUid: user.uid,
            voterName: user.displayName || user.email || user.uid,
          }),
        },
      );
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || `Vote failed: ${res.status}`);
      }
      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message || "Failed to submit vote");
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 p-3 text-red-800 dark:text-red-200">
          {error}
        </div>
      </div>
    );
  }
  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 p-3 text-yellow-800 dark:text-yellow-200">
          Session not found.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm p-5">
        <h1 className="text-lg font-semibold text-foreground">
          {session.name}
        </h1>
        <div
          className={cn(
            "rounded-lg border p-3 mt-2 text-sm",
            session.anonymous
              ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 text-blue-800 dark:text-blue-200"
              : "border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 text-gray-700 dark:text-gray-300",
          )}
        >
          {session.anonymous
            ? "This session is Anonymous. Your name will not be shown."
            : "This session is NOT anonymous. Your vote will show your name."}
        </div>
        <div className="mb-2 text-muted-foreground text-sm mt-2">
          Your name:{" "}
          <strong>
            {user?.displayName || user?.email || user?.uid || "Unknown"}
          </strong>{" "}
          · UID:{" "}
          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
            {user?.uid || "-"}
          </code>
        </div>
        {session.closed && (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 p-3 text-yellow-800 dark:text-yellow-200 mb-3">
            Voting closed.
          </div>
        )}

        {!submitted ? (
          <form onSubmit={(e) => e.preventDefault()}>
            <fieldset className="mb-3">
              <legend className="font-semibold text-sm text-foreground mb-2">
                {session.type === "vote-out"
                  ? "Select one to vote out"
                  : "Select one ally"}
              </legend>
              {pool.length === 0 && (
                <div className="text-muted-foreground">
                  No eligible players.
                </div>
              )}
              {pool.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 mb-2 cursor-pointer text-foreground"
                >
                  <input
                    type="radio"
                    name="choice"
                    value={p.id}
                    checked={choice === p.id}
                    onChange={(e) => setChoice(e.currentTarget.value)}
                    disabled={session.closed}
                    className="accent-primary-500"
                  />
                  {p.name}
                </label>
              ))}
            </fieldset>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={submitVote}
                disabled={session.closed}
                className="px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Vote
              </button>
              <Link
                href="/phasmotourney-series"
                className="px-4 py-2 rounded-lg border border-border dark:border-border-dark text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Back
              </Link>
            </div>
          </form>
        ) : (
          <div className="rounded-lg border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 p-3 text-green-800 dark:text-green-200 mt-3">
            Vote submitted! Thank you.
          </div>
        )}
      </div>
    </div>
  );
}

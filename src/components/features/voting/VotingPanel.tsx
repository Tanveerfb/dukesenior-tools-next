"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export interface VotingPanelProps {
  sessionId: string;
  round: number;
  candidates: string[];
  immunePlayerIds?: string[];
}

export default function VotingPanel({
  sessionId,
  candidates,
  immunePlayerIds = [],
}: VotingPanelProps) {
  const { user } = useAuth();
  const [choice, setChoice] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const disabled = !user;

  async function submit() {
    setError(null);
    setMessage(null);
    if (!user) {
      setError("Please log in to vote.");
      return;
    }
    if (!choice) {
      setError("Select a player to submit your vote.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/votes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, uid: user.uid, candidateId: choice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Vote failed ${res.status}`);
      setMessage("Thanks! Your vote was submitted.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const immuneSet = new Set(immunePlayerIds);
  const visibleCandidates = candidates.filter((c) => !immuneSet.has(c));

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
      {message && (
        <div
          className={cn(
            "rounded border border-green-400 bg-green-50 px-3 py-1 text-sm text-green-700",
            "dark:border-green-600 dark:bg-green-950 dark:text-green-300",
          )}
        >
          {message}
        </div>
      )}
      {!user && (
        <div
          className={cn(
            "rounded border border-yellow-400 bg-yellow-50 px-3 py-1 text-sm text-yellow-700",
            "dark:border-yellow-600 dark:bg-yellow-950 dark:text-yellow-300",
          )}
        >
          You must be logged in to vote.
        </div>
      )}
      <fieldset>
        {visibleCandidates.map((c) => (
          <label
            key={c}
            className={cn(
              "mb-1 flex cursor-pointer items-center gap-2 text-foreground",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <input
              type="radio"
              name={`vote-session-${sessionId}`}
              id={`${sessionId}-${c}`}
              value={c}
              disabled={disabled}
              onChange={(e) => setChoice(e.currentTarget.value)}
              className="accent-primary-500"
            />
            {c}
          </label>
        ))}
      </fieldset>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={disabled || submitting || !choice}
          className={cn(
            "rounded bg-primary-500 px-3 py-1 text-sm font-medium text-white",
            "hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {submitting ? (
            <span className="inline-flex items-center gap-1">
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
              Submitting
            </span>
          ) : (
            "Submit Vote"
          )}
        </button>
      </div>
      {immunePlayerIds.length > 0 && (
        <p className="mb-0 mt-2 text-sm text-foreground-secondary">
          Immune (not eligible): {immunePlayerIds.join(", ")}
        </p>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";

export interface VotingPanelProps {
  sessionId: string;
  round: number;
  candidates: string[];
  immunePlayerIds?: string[];
}

export default function VotingPanel({
  sessionId,
  round,
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
        <Alert variant="danger" className="py-1 small">
          {error}
        </Alert>
      )}
      {message && (
        <Alert variant="success" className="py-1 small">
          {message}
        </Alert>
      )}
      {!user && (
        <Alert variant="warning" className="py-1 small">
          You must be logged in to vote.
        </Alert>
      )}
      <Form>
        {visibleCandidates.map((c) => (
          <Form.Check
            key={c}
            type="radio"
            name={`vote-session-${sessionId}`}
            id={`${sessionId}-${c}`}
            label={c}
            value={c}
            disabled={disabled}
            onChange={(e) => setChoice(e.currentTarget.value)}
            className="mb-1"
          />
        ))}
      </Form>
      <div className="d-flex align-items-center gap-2 mt-2">
        <Button
          size="sm"
          onClick={submit}
          disabled={disabled || submitting || !choice}
        >
          {submitting ? (
            <>
              <Spinner size="sm" className="me-1" /> Submitting
            </>
          ) : (
            "Submit Vote"
          )}
        </Button>
      </div>
      {immunePlayerIds.length > 0 && (
        <p className="text-muted small mt-2 mb-0">
          Immune (not eligible): {immunePlayerIds.join(", ")}
        </p>
      )}
    </div>
  );
}

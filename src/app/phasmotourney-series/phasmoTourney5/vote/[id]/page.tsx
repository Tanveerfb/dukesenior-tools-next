"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Alert, Button, Card, Container, Form, Stack } from "react-bootstrap";

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
  const [idToken, setIdToken] = useState<string | null>(null);

  // Require login before using the page
  if (!user) {
    return (
      <Container className="py-4">
        <Alert variant="warning" className="mb-3">
          Login required to vote.{" "}
          <Link href="/login" className="alert-link">
            Log in
          </Link>
        </Alert>
      </Container>
    );
  }

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;
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
  }, [params?.id]);

  const active = useMemo(
    () => players.filter((p) => p.status === "Active"),
    [players]
  );
  const nonImmuneActive = useMemo(
    () => active.filter((p) => !p.immune),
    [active]
  );
  const pool = useMemo(
    () => (session?.type === "vote-out" ? nonImmuneActive : active),
    [session?.type, active, nonImmuneActive]
  );

  async function submitVote() {
    if (!session) return;
    if (!choice) return setError("Please select a player");
    if (session.closed) return setError("Voting closed");
    if (!user?.uid) return setError("Login required");
    const confirmed = window.confirm(
      `Confirm your vote for ${
        players.find((p) => p.id === choice)?.name || choice
      }?`
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
        }
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
      <Container className="py-4">
        <div className="text-muted">Loading…</div>
      </Container>
    );
  }
  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  if (!session) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Session not found.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Card.Title as="h1" className="h5 fw-semibold">
            {session.name}
          </Card.Title>
          <Alert
            variant={session.anonymous ? "info" : "secondary"}
            className="mt-2"
          >
            {session.anonymous
              ? "This session is Anonymous. Your name will not be shown."
              : "This session is NOT anonymous. Your vote will show your name."}
          </Alert>
          <div className="mb-2 text-muted small">
            Your name:{" "}
            <strong>
              {user?.displayName || user?.email || user?.uid || "Unknown"}
            </strong>{" "}
            · UID: <code>{user?.uid || "-"}</code>
          </div>
          {session.closed && (
            <Alert variant="warning" className="mb-3">
              Voting closed.
            </Alert>
          )}

          {!submitted ? (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  {session.type === "vote-out"
                    ? "Select one to vote out"
                    : "Select one ally"}
                </Form.Label>
                {pool.length === 0 && (
                  <div className="text-muted">No eligible players.</div>
                )}
                {pool.map((p) => (
                  <Form.Check
                    key={p.id}
                    type="radio"
                    name="choice"
                    id={`choice-${p.id}`}
                    label={p.name}
                    value={p.id}
                    checked={choice === p.id}
                    onChange={(e) => setChoice(e.currentTarget.value)}
                    className="mb-2"
                    disabled={session.closed}
                  />
                ))}
              </Form.Group>
              <Stack direction="horizontal" gap={3}>
                <Button
                  variant="primary"
                  onClick={submitVote}
                  disabled={session.closed}
                >
                  Submit Vote
                </Button>
                <Link
                  href="/phasmotourney-series"
                  className="btn btn-outline-secondary"
                >
                  Back
                </Link>
              </Stack>
            </Form>
          ) : (
            <Alert variant="success" className="mt-3">
              Vote submitted! Thank you.
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

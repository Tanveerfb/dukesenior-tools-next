"use client";
import { useEffect, useMemo, useState } from "react";
import { Alert, Card, Spinner } from "react-bootstrap";
import { useParams, useSearchParams } from "next/navigation";
import VotingPanel from "@/components/features/voting/VotingPanel";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

export default function VotingSessionPage() {
  const params = useParams();
  const sp = useSearchParams();
  const round = Number(params.round as string);
  const targetSession = sp.get("session");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/t5/voting-sessions/list?round=${round}`);
      if (!res.ok) throw new Error(`Failed to load sessions ${res.status}`);
      const data = await res.json();
      setSessions(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [round]);

  const filtered = useMemo(() => {
    if (!targetSession) return sessions as any[];
    return (sessions as any[]).filter((s) => s.id === targetSession);
  }, [sessions, targetSession]);

  const breadcrumbs = useMemo(
    () =>
      buildTourneyBreadcrumbs([
        {
          label: "Phasmo Tourney 5",
          href: "/phasmotourney-series/phasmotourney5",
        },
        { label: `Round ${round} Voting` },
      ]),
    [round]
  );

  return (
    <TourneyPage
      title={`Round ${round} Voting`}
      subtitle="Cast and review votes for the next challenge contender."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 5" }, { label: "Voting" }]}
      actions={[
        {
          label: "View results",
          href: "/phasmotourney-series/phasmotourney5/voting-results",
          variant: "outline-light",
        },
      ]}
      containerProps={{ className: "py-3" }}
    >
      {error && (
        <Alert variant="danger" className="small">
          {error}
        </Alert>
      )}
      {loading && (
        <div className="d-flex align-items-center gap-2 mb-3">
          <Spinner size="sm" /> Loading…
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <Alert variant="info" className="small">
          No sessions found.
        </Alert>
      )}
      {filtered.map((s) => (
        <Card key={s.id} className="shadow-sm mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Session {s.id.slice(0, 6)}</strong>
              <span className="text-muted small">
                {s.open ? "Open" : "Closed"}
              </span>
            </div>
            <VotingPanel
              sessionId={s.id}
              round={s.round}
              candidates={s.candidatePlayerIds || []}
              immunePlayerIds={s.immunePlayerIds || []}
            />
          </Card.Body>
        </Card>
      ))}
    </TourneyPage>
  );
}

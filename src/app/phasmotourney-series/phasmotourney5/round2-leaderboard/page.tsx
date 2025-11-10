"use client";
import { useEffect, useState } from "react";
import { Alert, Spinner, Table } from "react-bootstrap";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

interface Row {
  player: string;
  money: number;
  map?: string;
  submittedAt?: number;
}

export default function Round2LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/t5/round2/scoreboard`);
        if (!res.ok) throw new Error(`Failed to load ${res.status}`);
        const data = await res.json();
        if (active) setRows(data);
      } catch (e: any) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <TourneyPage
      title="Round 2 Leaderboard"
      subtitle="Money round standings for Phasmo Tourney 5. Higher cash totals place you higher."
      breadcrumbs={buildTourneyBreadcrumbs([
        {
          label: "Phasmo Tourney 5",
          href: "/phasmotourney-series/phasmotourney5",
        },
        { label: "Round 2 Leaderboard" },
      ])}
      badges={[{ label: "Phasmo Tourney 5" }, { label: "Round 2" }]}
      actions={[
        {
          label: "Back to overview",
          href: "/phasmotourney-series/phasmotourney5",
          variant: "outline-light",
        },
      ]}
      containerProps={{ className: "py-3" }}
    >
      <p className="text-muted small">
        Money Round — higher total money from game summary ranks higher. No
        eliminations this round.
      </p>
      {error && (
        <Alert variant="danger" className="py-1 small">
          {error}
        </Alert>
      )}
      {loading && (
        <div className="d-flex align-items-center gap-2 small">
          <Spinner size="sm" /> Loading…
        </div>
      )}
      {!loading && rows.length === 0 && (
        <Alert variant="info" className="small">
          No submissions yet.
        </Alert>
      )}
      {!loading && rows.length > 0 && (
        <Table striped hover responsive size="sm" className="align-middle">
          <thead>
            <tr>
              <th style={{ width: "10%" }}>Rank</th>
              <th style={{ width: "45%" }}>Player</th>
              <th style={{ width: "25%" }}>Money ($)</th>
              <th style={{ width: "20%" }}>Map</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.player}>
                <td>#{idx + 1}</td>
                <td>{r.player}</td>
                <td className="fw-semibold">${r.money}</td>
                <td className="text-muted">{r.map || "—"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </TourneyPage>
  );
}

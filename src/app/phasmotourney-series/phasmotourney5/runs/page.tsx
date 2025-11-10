"use client";
import { useEffect, useState } from "react";
import { Alert, Badge, Spinner, Table } from "react-bootstrap";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

interface T5RunRecord {
  id: string;
  player: string;
  marks: number;
  runTimeMs: number;
  wildcard?: string;
  submittedAt: number;
}

export default function Tourney5RunsPage() {
  const [runs, setRuns] = useState<T5RunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/t5/runs/list");
        if (res.ok) {
          setRuns(await res.json());
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return (
    <TourneyPage
      title="Recorded Runs"
      subtitle="Round 1 submissions captured from the Phasmo Tourney 5 API."
      breadcrumbs={buildTourneyBreadcrumbs([
        {
          label: "Phasmo Tourney 5",
          href: "/phasmotourney-series/phasmotourney5",
        },
        { label: "Recorded Runs" },
      ])}
      badges={[{ label: "Phasmo Tourney 5" }, { label: "Runs" }]}
      actions={[
        {
          label: "View players",
          href: "/phasmotourney-series/phasmotourney5/players",
          variant: "outline-light",
        },
      ]}
      containerProps={{ className: "py-3" }}
    >
      {loading && <Spinner size="sm" animation="border" />}
      {!loading && runs.length === 0 && (
        <Alert variant="info" className="small">
          No runs submitted yet.
        </Alert>
      )}
      {!loading && runs.length > 0 && (
        <Table striped hover size="sm" responsive className="mt-2">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Marks</th>
              <th>Run Time</th>
              <th>Wildcard</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r, i) => (
              <tr key={r.id}>
                <td>{i + 1}</td>
                <td>{r.player}</td>
                <td className="fw-bold">{r.marks}</td>
                <td>{Math.round(r.runTimeMs / 1000)}s</td>
                <td>
                  {r.wildcard ? <Badge bg="dark">{r.wildcard}</Badge> : "—"}
                </td>
                <td>{new Date(r.submittedAt).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </TourneyPage>
  );
}

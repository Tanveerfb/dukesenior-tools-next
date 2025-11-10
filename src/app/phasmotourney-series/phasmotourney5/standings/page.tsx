"use client";
import { Alert, Badge, Table } from "react-bootstrap";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

export default function Tourney5StandingsPage() {
  const rows: any[] = [];
  return (
    <TourneyPage
      title="Standings"
      subtitle="Round 1 leaderboard for Phasmo Tourney 5 — immunity awaits the top performers."
      breadcrumbs={buildTourneyBreadcrumbs([
        {
          label: "Phasmo Tourney 5",
          href: "/phasmotourney-series/phasmotourney5",
        },
        { label: "Standings" },
      ])}
      badges={[{ label: "Phasmo Tourney 5" }, { label: "Standings" }]}
      containerProps={{ className: "py-3" }}
    >
      <Alert variant="secondary" className="small">
        Top 2 gain <Badge bg="success">Immunity</Badge>. Remaining players
        participate in voting.
      </Alert>
      {rows.length === 0 ? (
        <Alert variant="info" className="small">
          No players yet. Standings will appear as players and runs are added.
        </Alert>
      ) : (
        <Table striped hover size="sm" responsive>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Marks</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.name}>
                <td>{idx + 1}</td>
                <td>{r.name}</td>
                <td className="fw-bold">{r.marks}</td>
                <td>{r.immune ? <Badge bg="success">Immune</Badge> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </TourneyPage>
  );
}

"use client";
import { useEffect, useState } from "react";
import { Alert, Table } from "react-bootstrap";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { getStandingsT3 } from "@/lib/services/phasmoTourney3";

export default function T3StandingsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      const list = await getStandingsT3();
      setRows(list);
      setReady(true);
    })();
  }, []);
  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney 3", href: "/phasmotourney-series/phasmotourney3" },
    { label: "Standings" },
  ]);
  return (
    <TourneyPage
      title="Standings"
      subtitle="Aggregated totals per duo straight from the Tourney 3 scoreboard."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 3" }, { label: "Standings" }]}
      containerProps={{ fluid: "lg", className: "py-3" }}
    >
      {ready ? (
        <Table striped hover responsive size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>Scores</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.teamID || i}>
                <td>{i + 1}</td>
                <td>
                  {r.player1} & {r.player2}
                </td>
                <td>{(r.scores || []).join(", ")}</td>
                <td>
                  <b>{r.total || 0}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert>Loading standings...</Alert>
      )}
    </TourneyPage>
  );
}

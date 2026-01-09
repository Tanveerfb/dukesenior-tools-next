"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert, Table } from "react-bootstrap";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { getPhasmoTourney3Data } from "@/lib/services/phasmoTourney3";

export default function T3RecordedRunsPage() {
  const [data, setData] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  async function fetchData() {
    const snap = await getPhasmoTourney3Data();
    const list: any[] = [];
    snap.forEach((r) => list.push([r.data(), r.id]));
    setData(list);
    setReady(true);
  }
  useEffect(() => {
    fetchData();
  }, []);
  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney 3", href: "/phasmotourney-series/phasmotourney3" },
    { label: "Recorded Runs" },
  ]);

  return (
    <TourneyPage
      title="Recorded Runs"
      subtitle="Official submissions from Phasmo Tourney 3, including redemption attempts."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 3" }, { label: "Runs" }]}
      containerProps={{ fluid: "lg", className: "py-4 text-center" }}
    >
      {ready ? (
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Round</th>
              <th>Date Recorded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => {
              const originalId = r[1];
              const slug = originalId.replace(/\s+/g, "_");
              return (
                <tr key={originalId}>
                  <td>{r[0]?.Participant}</td>
                  <td>
                    {r[0]?.Round}
                    {r[0]?.Redemption ? " Redemption" : ""}
                  </td>
                  <td>{new Date(r[0]?.TimeSubmitted).toDateString()}</td>
                  <td>
                    {originalId && (
                      <Link
                        className="text-warning"
                        href={`/phasmotourney-series/phasmotourney3/runs/${slug}`}
                      >
                        Details
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <Alert>Data is not ready</Alert>
      )}
    </TourneyPage>
  );
}

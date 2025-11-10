"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert, Badge, Spinner, Table } from "react-bootstrap";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

interface Player {
  preferredName: string;
  twitch?: string;
  youtube?: string;
  steam?: string;
  phasmoHours?: number;
  prestigeAtAdmission?: string;
  previousTourney?: boolean;
}

export default function Tourney5PlayersList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/t5/players/list");
      if (res.ok) {
        setPlayers(await res.json());
      }
      setLoading(false);
    })();
  }, []);

  return (
    <TourneyPage
      title="Players"
      subtitle="Active roster for Phasmo Tourney 5, pulled directly from the player registry."
      breadcrumbs={buildTourneyBreadcrumbs([
        {
          label: "Phasmo Tourney 5",
          href: "/phasmotourney-series/phasmotourney5",
        },
        { label: "Players" },
      ])}
      badges={[{ label: "Phasmo Tourney 5" }, { label: "Roster" }]}
      actions={[
        {
          label: "Back to overview",
          href: "/phasmotourney-series/phasmotourney5",
          variant: "outline-light",
        },
      ]}
      containerProps={{ className: "py-3" }}
    >
      {loading && <Spinner animation="border" />}
      {!loading && players.length === 0 && (
        <Alert variant="info" className="small">
          No players added yet.
        </Alert>
      )}
      {!loading && players.length > 0 && (
        <Table hover responsive size="sm" className="align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Prestige</th>
              <th>Hours</th>
              <th>Prev Tourney?</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.preferredName}>
                <td>
                  <Link
                    href={`/phasmotourney-series/phasmotourney5/players/${encodeURIComponent(
                      p.preferredName
                    )}`}
                  >
                    {p.preferredName}
                  </Link>
                </td>
                <td>{p.prestigeAtAdmission || "—"}</td>
                <td>
                  {typeof p.phasmoHours === "number" ? p.phasmoHours : "—"}
                </td>
                <td>
                  {p.previousTourney ? (
                    <Badge bg="success">Yes</Badge>
                  ) : (
                    <Badge bg="secondary">No</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <p className="small text-muted mt-3">
        Player profiles include wildcard, run, and voting performance once
        recorded.
      </p>
    </TourneyPage>
  );
}

"use client";
import { useEffect, useState } from "react";
import { Alert, Badge, Table } from "react-bootstrap";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { getStandingsT3 } from "@/lib/services/phasmoTourney3";

export default function T3PlayersPage() {
  const [teams, setTeams] = useState<
    {
      teamLabel: string;
      total: number;
      teamID?: string;
      members: string;
      eliminated: boolean;
    }[]
  >([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      const standings: any[] = await getStandingsT3();
      const teamList = standings.map((t) => {
        const members =
          [t.player1, t.player2].filter(Boolean).join(" & ") || "Unknown";
        const total = typeof t.total === "number" ? t.total : 0;
        const eliminated = total < 0;
        return {
          teamLabel: t.teamID ? `Team ${t.teamID}` : t.teamName || "Team",
          total,
          teamID: t.teamID,
          members,
          eliminated,
        };
      });
      teamList.sort(
        (a, b) =>
          b.total - a.total || (a.teamID || "").localeCompare(b.teamID || "")
      );
      setTeams(teamList);
      setReady(true);
    })();
  }, []);
  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney 3", href: "/phasmotourney-series/phasmotourney3" },
    { label: "Teams" },
  ]);
  return (
    <TourneyPage
      title="Teams"
      subtitle="Roster overview with running totals for every Phasmo Tourney 3 duo."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 3" }, { label: "Teams" }]}
      actions={[
        {
          label: "View Standings",
          href: "/phasmotourney-series/phasmotourney3/standings",
        },
      ]}
      containerProps={{ fluid: "lg", className: "py-3" }}
    >
      {ready ? (
        <Table striped hover responsive size="sm">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Members</th>
              <th>Total Points</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t, i) => (
              <tr
                key={t.teamLabel + i}
                className={t.eliminated ? "opacity-75" : ""}
              >
                <td>{t.total >= 0 ? i + 1 : "-"}</td>
                <td>{t.teamLabel}</td>
                <td>{t.members}</td>
                <td>
                  <Badge bg={t.eliminated ? "secondary" : "primary"}>
                    {t.total}
                  </Badge>
                </td>
                <td>
                  {t.eliminated ? (
                    <Badge bg="danger">Eliminated</Badge>
                  ) : (
                    <Badge bg="success">Active</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert>Loading teams...</Alert>
      )}
      <p className="text-muted small mt-2">
        Negative totals (if present) indicate eliminated teams per historical
        convention.
      </p>
    </TourneyPage>
  );
}

"use client";
import { useEffect, useState } from "react";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { getStandingsT3 } from "@/lib/services/phasmoTourney3";
import { cn } from "@/lib/utils";

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
          b.total - a.total || (a.teamID || "").localeCompare(b.teamID || ""),
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
      containerProps={{ className: "py-3" }}
    >
      {ready ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border dark:border-border-dark text-foreground-muted">
              <tr>
                <th className="px-3 py-2">Rank</th>
                <th className="px-3 py-2">Team</th>
                <th className="px-3 py-2">Members</th>
                <th className="px-3 py-2">Total Points</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {teams.map((t, i) => (
                <tr
                  key={t.teamLabel + i}
                  className={cn(
                    "hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors",
                    i % 2 === 0 && "bg-surface-50 dark:bg-surface-900/40",
                    t.eliminated && "opacity-75",
                  )}
                >
                  <td className="px-3 py-2">{t.total >= 0 ? i + 1 : "-"}</td>
                  <td className="px-3 py-2">{t.teamLabel}</td>
                  <td className="px-3 py-2">{t.members}</td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "rounded-full text-xs font-medium px-2.5 py-0.5 text-white",
                        t.eliminated ? "bg-secondary" : "bg-primary",
                      )}
                    >
                      {t.total}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {t.eliminated ? (
                      <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-danger text-white">
                        Eliminated
                      </span>
                    ) : (
                      <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-success text-white">
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-info/30 bg-info-50 dark:bg-info/10 px-4 py-3 text-info-600 dark:text-info">
          Loading teams...
        </div>
      )}
      <p className="text-foreground-muted text-sm mt-2">
        Negative totals (if present) indicate eliminated teams per historical
        convention.
      </p>
    </TourneyPage>
  );
}

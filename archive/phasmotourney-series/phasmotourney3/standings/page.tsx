"use client";
import { useEffect, useState } from "react";
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
      containerProps={{ className: "py-3" }}
    >
      {ready ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border dark:border-border-dark text-foreground-muted">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Team</th>
                <th className="px-3 py-2">Scores</th>
                <th className="px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {rows.map((r, i) => (
                <tr
                  key={r.teamID || i}
                  className={
                    i % 2 === 0
                      ? "bg-surface-50 dark:bg-surface-900/40 hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors"
                      : "hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors"
                  }
                >
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">
                    {r.player1} & {r.player2}
                  </td>
                  <td className="px-3 py-2">{(r.scores || []).join(", ")}</td>
                  <td className="px-3 py-2">
                    <b>{r.total || 0}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-info/30 bg-info-50 dark:bg-info/10 px-4 py-3 text-info-600 dark:text-info">
          Loading standings...
        </div>
      )}
    </TourneyPage>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
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
      containerProps={{ className: "py-4 text-center" }}
    >
      {ready ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border dark:border-border-dark text-foreground-muted">
              <tr>
                <th className="px-3 py-2">Team Name</th>
                <th className="px-3 py-2">Round</th>
                <th className="px-3 py-2">Date Recorded</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {data.map((r, i) => {
                const originalId = r[1];
                const slug = originalId.replace(/\s+/g, "_");
                return (
                  <tr
                    key={originalId}
                    className={
                      i % 2 === 0
                        ? "bg-surface-50 dark:bg-surface-900/40 hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors"
                        : "hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors"
                    }
                  >
                    <td className="px-3 py-2">{r[0]?.Participant}</td>
                    <td className="px-3 py-2">
                      {r[0]?.Round}
                      {r[0]?.Redemption ? " Redemption" : ""}
                    </td>
                    <td className="px-3 py-2">
                      {new Date(r[0]?.TimeSubmitted).toDateString()}
                    </td>
                    <td className="px-3 py-2">
                      {originalId && (
                        <Link
                          className="text-warning hover:underline"
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
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-info/30 bg-info-50 dark:bg-info/10 px-4 py-3 text-info-600 dark:text-info">
          Data is not ready
        </div>
      )}
    </TourneyPage>
  );
}

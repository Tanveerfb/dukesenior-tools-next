"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { getPhasmoTourney2Data } from "@/lib/services/phasmoTourney2";

export default function PhasmoTourney2RecordsPage() {
  const [data, setData] = useState<any[]>([]);
  const [ready, setReady] = useState(false);

  async function fetchData() {
    const snap = await getPhasmoTourney2Data();
    const list: any[] = [];
    snap.forEach((r) => list.push([r.data(), r.id]));
    setData(list);
    setReady(true);
  }
  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney 2", href: "/phasmotourney-series/phasmotourney2" },
    { label: "Recorded Runs" },
  ]);

  return (
    <TourneyPage
      title="Recorded Runs"
      subtitle="Official submissions logged during Phasmo Tourney 2."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 2" }, { label: "Runs" }]}
      containerProps={{ className: "py-4" }}
    >
      {ready ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="text-left px-3 py-2 font-semibold text-foreground">
                  Participant Name
                </th>
                <th className="text-left px-3 py-2 font-semibold text-foreground">
                  Officer name
                </th>
                <th className="text-left px-3 py-2 font-semibold text-foreground">
                  Map name
                </th>
                <th className="text-left px-3 py-2 font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => {
                const twitchlink = `https://www.twitch.tv/${r[0]?.Participant}`;
                return (
                  <tr
                    key={r[1]}
                    className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <td className="px-3 py-2">
                      <InlineLink
                        href={twitchlink}
                        target="_blank"
                        className="inline-block px-3 py-1.5 rounded-lg bg-primary-500 text-white text-sm hover:bg-primary-600 transition-colors"
                      >
                        {r[0]?.Participant}
                      </InlineLink>
                    </td>
                    <td className="px-3 py-2 text-foreground">
                      {r[0]?.Officer}
                    </td>
                    <td className="px-3 py-2 text-foreground">{r[0]?.Map}</td>
                    <td className="px-3 py-2">
                      {r[1] && (
                        <Link
                          href={`/phasmotourney-series/phasmotourney2/${r[1]}`}
                          className="text-primary-500 hover:underline"
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
        <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 px-4 py-3">
          Data is not ready
        </div>
      )}
    </TourneyPage>
  );
}

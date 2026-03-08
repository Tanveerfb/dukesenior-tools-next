"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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
  return (
    <div className="max-w-5xl mx-auto px-4 mb-3 text-center">
      <h2 className="mt-3 text-xl font-semibold text-foreground">
        Phasmo Tourney #3 Recorded Runs
      </h2>
      {ready ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="py-2 pr-4 font-semibold text-foreground">
                  Team Name
                </th>
                <th className="py-2 pr-4 font-semibold text-foreground">
                  Round
                </th>
                <th className="py-2 pr-4 font-semibold text-foreground">
                  Date Recorded
                </th>
                <th className="py-2 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => {
                const originalId = r[1];
                const slug = originalId.replace(/\s+/g, "_");
                return (
                  <tr
                    key={originalId}
                    className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30"
                  >
                    <td className="py-2 pr-4 text-foreground">
                      {r[0]?.Participant}
                    </td>
                    <td className="py-2 pr-4 text-foreground">
                      {r[0]?.Round}
                      {r[0]?.Redemption ? " Redemption" : ""}
                    </td>
                    <td className="py-2 pr-4 text-foreground">
                      {new Date(r[0]?.TimeSubmitted).toDateString()}
                    </td>
                    <td className="py-2">
                      {originalId && (
                        <Link
                          className="text-yellow-500 hover:underline"
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
        <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 p-3 text-blue-800 dark:text-blue-200 mt-3">
          Data is not ready
        </div>
      )}
    </div>
  );
}

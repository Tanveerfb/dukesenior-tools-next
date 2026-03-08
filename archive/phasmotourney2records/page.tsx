"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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

  return (
    <div className="max-w-5xl mx-auto px-4 mb-3">
      {ready ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="py-2 pr-4 font-semibold text-foreground">
                  Participant Name
                </th>
                <th className="py-2 pr-4 font-semibold text-foreground">
                  Officer name
                </th>
                <th className="py-2 pr-4 font-semibold text-foreground">
                  Map name
                </th>
                <th className="py-2 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => {
                const twitchlink = `https://www.twitch.tv/${r[0]?.Participant}`;
                return (
                  <tr
                    key={r[1]}
                    className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-2 pr-4">
                      <Link
                        href={twitchlink}
                        target="_blank"
                        className="inline-block px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                      >
                        {r[0]?.Participant}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-foreground">
                      {r[0]?.Officer}
                    </td>
                    <td className="py-2 pr-4 text-foreground">{r[0]?.Map}</td>
                    <td className="py-2">
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
        <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 p-3 text-blue-800 dark:text-blue-200">
          Data is not ready
        </div>
      )}
    </div>
  );
}

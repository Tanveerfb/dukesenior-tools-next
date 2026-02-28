"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getPhasmoTourneyData } from "@/lib/services/phasmoTourney1";

export default function PhasmoTourney1RecordsPage() {
  const [data, setData] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      const snap = await getPhasmoTourneyData();
      const list: any[] = [];
      snap.forEach((r) => list.push([r.data(), r.id]));
      setData(list);
      setReady(true);
    })();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-3">
      <h2 className="text-xl font-bold text-foreground mb-4">
        Phasmo Tourney 1 - Recorded Runs
      </h2>
      {ready ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="text-left px-3 py-2 font-semibold text-foreground">
                  Player
                </th>
                <th className="text-left px-3 py-2 font-semibold text-foreground">
                  Map
                </th>
                <th className="text-left px-3 py-2 font-semibold text-foreground">
                  Time
                </th>
                <th className="text-left px-3 py-2 font-semibold text-foreground">
                  Run ID
                </th>
                <th className="text-left px-3 py-2 font-semibold text-foreground">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr
                  key={r[1]}
                  className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <td className="px-3 py-2 text-foreground">
                    {r[0]?.Participant}
                  </td>
                  <td className="px-3 py-2 text-foreground">{r[0]?.Map}</td>
                  <td className="px-3 py-2 text-foreground">
                    {new Date(r[0]?.TimeSubmitted).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-foreground">{r[1]}</td>
                  <td className="px-3 py-2">
                    {r[1] && (
                      <Link
                        href={`/phasmotourney-series/phasmotourney1/records/${r[1]}`}
                        className="text-primary-500 hover:underline"
                      >
                        Details
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 px-4 py-3">
          Data not ready
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { getBracketStandings } from "@/lib/services/phasmoTourney4";

const badgeColor: Record<string, string> = {
  success: "bg-green-600 text-white",
  danger: "bg-red-600 text-white",
  secondary: "bg-gray-500 text-white",
  dark: "bg-gray-800 text-white",
  primary: "bg-primary-500 text-white",
};

function MatchBadge({ letter }: { letter: string }) {
  const variant =
    letter === "W"
      ? "success"
      : letter === "L"
        ? "danger"
        : letter === "T"
          ? "secondary"
          : "dark";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full text-xs font-medium px-2 py-0.5 min-w-[24px]",
        badgeColor[variant],
      )}
    >
      {letter}
    </span>
  );
}

function StandingsTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-border dark:border-border-dark bg-card dark:bg-card-dark">
            <th className="px-3 py-2">Rank</th>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">W</th>
            <th className="px-3 py-2">L</th>
            <th className="px-3 py-2">T</th>
            <th className="px-3 py-2">Points</th>
            <th className="px-3 py-2 text-center">Last 3 matches</th>
          </tr>
        </thead>
        <tbody>
          {data.map((b, idx) => {
            const mh = b[0].matchHistory || [];
            const codes = [
              mh[mh.length - 1],
              mh[mh.length - 2],
              mh[mh.length - 3],
            ];
            return (
              <tr
                key={idx}
                className={cn(
                  "border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5",
                  idx % 2 === 0 && "bg-black/[0.02] dark:bg-white/[0.02]",
                )}
              >
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2">{b[0].name}</td>
                <td className="px-3 py-2">{b[0].wins}</td>
                <td className="px-3 py-2">{b[0].losses}</td>
                <td className="px-3 py-2">{b[0].ties}</td>
                <td className="px-3 py-2 font-bold">{b[0].points}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-center items-center gap-1">
                    {codes.map((c, i) => {
                      const letter = c?.substring(0, 1) || "N";
                      return <MatchBadge key={i} letter={letter} />;
                    })}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Tourney4GroupedStandingsPage() {
  const [b1, setB1] = useState<any[]>([]);
  const [b2, setB2] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<"1" | "2">("1");

  useEffect(() => {
    (async () => {
      const snap1 = await getBracketStandings(1);
      const list1: any[] = [];
      snap1.forEach((b) => list1.push([b.data()]));
      const snap2 = await getBracketStandings(2);
      const list2: any[] = [];
      snap2.forEach((b) => list2.push([b.data()]));
      setB1(list1);
      setB2(list2);
      setReady(true);
    })();
  }, []);

  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney 4", href: "/phasmotourney-series/phasmotourney4" },
    { label: "Standings" },
  ]);

  return (
    <TourneyPage
      title="Standings"
      subtitle="Live snapshot from Firebase, reflecting the latest reported bracket results."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 4" }, { label: "Standings" }]}
      containerProps={{ className: "py-4" }}
    >
      {ready && (
        <>
          {/* Alert */}
          <div className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-4 py-3 text-sm font-bold mb-4 text-foreground">
            Top 4 from each bracket advance to the playoffs.
          </div>

          {/* Legend */}
          <div className="p-2 bg-card dark:bg-card-dark rounded flex flex-wrap justify-between gap-3 text-sm mb-4">
            <span className="inline-flex items-center gap-1">
              <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-green-600 text-white">
                W
              </span>
              Win
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-red-600 text-white">
                L
              </span>
              Loss
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-gray-800 text-white">
                T
              </span>
              Tie
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-primary-500 text-white">
                N
              </span>
              Not available
            </span>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border dark:border-border-dark mb-4">
            {(["1", "2"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === key
                    ? "border-b-2 border-primary-500 text-primary-500"
                    : "text-foreground/60 hover:text-foreground",
                )}
              >
                Bracket {key}
              </button>
            ))}
          </div>

          {activeTab === "1" && <StandingsTable data={b1} />}
          {activeTab === "2" && <StandingsTable data={b2} />}
        </>
      )}
    </TourneyPage>
  );
}

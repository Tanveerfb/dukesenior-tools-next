"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import {
  getMostRuns,
  getAvgRuns,
  getCurrentStreakStandings,
  getBestStreakStandings,
} from "@/lib/services/phasmoTourney4";

const rankBadgeColor: Record<string, string> = {
  warning: "bg-yellow-500 text-gray-900",
  secondary: "bg-gray-500 text-white",
  info: "bg-cyan-500 text-gray-900",
  dark: "bg-gray-800 text-white",
};

function RankBadge({ index }: { index: number }) {
  const variant =
    index === 0
      ? "warning"
      : index === 1
        ? "secondary"
        : index === 2
          ? "info"
          : "dark";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full text-xs font-medium px-2.5 py-0.5",
        rankBadgeColor[variant],
      )}
    >
      {index + 1}
    </span>
  );
}

interface StatBlock {
  title: string;
  rows: any[];
  cols: {
    key: string;
    label: string;
    render?: (row: any, i: number) => React.ReactNode;
  }[];
  description?: string;
}

export default function Tourney4GroupedStatsPage() {
  const [mostRuns, setMostRuns] = useState<any[]>([]);
  const [avgRuns, setAvgRuns] = useState<any[]>([]);
  const [currentStreak, setCurrentStreak] = useState<any[]>([]);
  const [bestStreak, setBestStreak] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | undefined>();
  useEffect(() => {
    (async () => {
      try {
        const [m, a, c, b] = await Promise.all([
          getMostRuns(),
          getAvgRuns(),
          getCurrentStreakStandings(),
          getBestStreakStandings(),
        ]);
        setMostRuns(m);
        setAvgRuns(a);
        setCurrentStreak(c);
        setBestStreak(b);
        setReady(true);
      } catch (e: any) {
        setError(e?.message || "Failed to load stats");
      }
    })();
  }, []);

  const blocks: StatBlock[] = [
    {
      title: "Most Runs (Total Score)",
      rows: mostRuns,
      cols: [
        { key: "rank", label: "#", render: (_r, i) => <RankBadge index={i} /> },
        { key: "name", label: "Player" },
        { key: "totalScore", label: "Total Score" },
      ],
    },
    {
      title: "Average Score",
      rows: avgRuns,
      cols: [
        { key: "rank", label: "#", render: (_r, i) => <RankBadge index={i} /> },
        { key: "name", label: "Player" },
        { key: "avgScore", label: "Avg Score" },
      ],
    },
    {
      title: "Current Streak",
      rows: currentStreak,
      cols: [
        { key: "rank", label: "#", render: (_r, i) => <RankBadge index={i} /> },
        { key: "name", label: "Player" },
        { key: "streak", label: "Streak" },
      ],
    },
    {
      title: "Best Streak",
      rows: bestStreak,
      cols: [
        { key: "rank", label: "#", render: (_r, i) => <RankBadge index={i} /> },
        { key: "name", label: "Player" },
        { key: "bestStreak", label: "Best" },
      ],
    },
  ];

  function renderBlock(block: StatBlock) {
    return (
      <div className="col-span-12 md:col-span-6 mb-4" key={block.title}>
        <div className="h-full flex flex-col rounded-lg border border-white/10 bg-white/[0.02] dark:bg-white/[0.02] p-3">
          <div className="flex justify-between items-center mb-2">
            <h5 className="text-base font-semibold m-0">{block.title}</h5>
          </div>
          <div className="flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {block.cols.map((c) => (
                      <th
                        key={c.key}
                        className="px-2 py-1.5 text-left text-xs uppercase tracking-wide bg-white/5"
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((r, i) => (
                    <tr
                      key={r.name || i}
                      className="border-b border-white/5 hover:bg-white/[0.04] transition-colors"
                    >
                      {block.cols.map((c) => (
                        <td key={c.key} className="px-2 py-1.5">
                          {c.render ? c.render(r, i) : r[c.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {block.rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={block.cols.length}
                        className="text-foreground/50 text-sm italic text-center py-3"
                      >
                        No data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney 4", href: "/phasmotourney-series/phasmotourney4" },
    { label: "Player Leaderboards" },
  ]);

  return (
    <TourneyPage
      title="Player Leaderboards"
      subtitle="Auto-generated from the live run submissions. Updated whenever the data service syncs."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 4" }, { label: "Stats" }]}
      containerProps={{ className: "py-4" }}
    >
      <p className="text-foreground/50 text-sm">
        Separate tables for each leaderboard metric. Ranking badges highlight
        the top three finishers.
      </p>
      {!ready && !error && (
        <div className="flex items-center gap-2 text-sm mb-3">
          <svg
            className="animate-spin h-4 w-4 text-primary-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Loading stats...</span>
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-800 dark:text-red-300 mb-4">
          {error}
        </div>
      )}
      {ready && (
        <div className="grid grid-cols-12 gap-x-4">
          {blocks.map(renderBlock)}
        </div>
      )}
    </TourneyPage>
  );
}

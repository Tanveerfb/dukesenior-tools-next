"use client";

import { use, useState } from "react";
import { cn } from "@/lib/utils";
import { FaTrophy, FaUsers, FaCalendar, FaChartBar } from "react-icons/fa";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import {
  getTournamentMeta,
  getTournamentOverview,
} from "@/lib/data/tournamentArchive";
import D3Bracket from "@/components/bracket/D3Bracket";
import type { BracketNode } from "@/types/archive";

interface TourneyDetailPageProps {
  params: Promise<{ tourneyId: string }>;
}

const TABS = ["overview", "bracket", "standings", "runs"] as const;
type TabKey = (typeof TABS)[number];
const TAB_LABELS: Record<TabKey, string> = {
  overview: "Overview",
  bracket: "Bracket",
  standings: "Standings",
  runs: "Recorded Runs",
};

export default function TourneyDetailPage({ params }: TourneyDetailPageProps) {
  const { tourneyId } = use(params);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const tournament = getTournamentMeta(tourneyId);
  const overview = getTournamentOverview(tourneyId);

  if (!tournament || !overview) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-foreground">
          Tournament Not Found
        </h1>
        <p className="text-foreground-secondary mt-2">
          The tournament you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Archive", href: "/phasmotourney-series/archive" },
    { label: tournament.title },
  ]);

  // Placeholder bracket data - will be replaced with real data in future
  const placeholderBracketData: BracketNode[] = [
    {
      id: "r1-m1",
      round: 1,
      match: 1,
      player1: "Player A",
      player2: "Player B",
      score1: 2,
      score2: 1,
      winner: "Player A",
      nextMatchId: "r2-m1",
    },
    {
      id: "r1-m2",
      round: 1,
      match: 2,
      player1: "Player C",
      player2: "Player D",
      score1: 1,
      score2: 2,
      winner: "Player D",
      nextMatchId: "r2-m1",
    },
    {
      id: "r2-m1",
      round: 2,
      match: 3,
      player1: "Player A",
      player2: "Player D",
      score1: 2,
      score2: 0,
      winner: "Player A",
    },
  ];

  // Placeholder standings data
  const placeholderStandings = [
    {
      rank: 1,
      player: tournament.winner || "TBD",
      wins: 10,
      losses: 2,
      points: 350,
    },
    {
      rank: 2,
      player: overview.runnerUp || "TBD",
      wins: 8,
      losses: 4,
      points: 320,
    },
    { rank: 3, player: "Player 3", wins: 7, losses: 5, points: 280 },
    { rank: 4, player: "Player 4", wins: 6, losses: 6, points: 250 },
  ];

  // Placeholder runs data
  const placeholderRuns = [
    {
      id: 1,
      player: tournament.winner || "TBD",
      map: "Tanglewood",
      score: 45,
      time: "8:32",
      date: "2023-08-15",
    },
    {
      id: 2,
      player: overview.runnerUp || "TBD",
      map: "Bleasdale",
      score: 42,
      time: "9:15",
      date: "2023-08-15",
    },
    {
      id: 3,
      player: "Player 3",
      map: "Prison",
      score: 38,
      time: "10:22",
      date: "2023-08-14",
    },
  ];

  return (
    <TourneyPage
      title={tournament.title}
      subtitle={tournament.description}
      breadcrumbs={breadcrumbs}
      badges={[
        { label: tournament.shortTitle, variant: "secondary" },
        { label: tournament.status, variant: "success" },
      ]}
      containerProps={{ className: "py-4" }}
    >
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border dark:border-border-dark mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium -mb-px transition-colors",
              activeTab === tab
                ? "border-b-2 border-primary-500 text-primary-500"
                : "text-foreground-secondary hover:text-foreground",
            )}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-xl border border-border bg-card shadow-sm dark:bg-card-dark dark:border-border-dark overflow-hidden">
              <div className="bg-primary-500 text-white px-4 py-3">
                <h5 className="text-base font-semibold m-0">
                  Tournament Information
                </h5>
              </div>
              <div className="p-5">
                <p className="text-lg text-foreground-secondary mb-4">
                  {overview.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FaTrophy className="text-yellow-500" size={20} />
                      <strong className="text-foreground">Format:</strong>
                    </div>
                    <div className="ml-7 text-foreground-secondary">
                      {overview.format}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FaCalendar className="text-blue-400" size={20} />
                      <strong className="text-foreground">Year:</strong>
                    </div>
                    <div className="ml-7 text-foreground-secondary">
                      {overview.year}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FaUsers className="text-primary-500" size={20} />
                      <strong className="text-foreground">Participants:</strong>
                    </div>
                    <div className="ml-7 text-foreground-secondary">
                      {overview.participants} players
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FaChartBar className="text-green-500" size={20} />
                      <strong className="text-foreground">
                        Total Matches:
                      </strong>
                    </div>
                    <div className="ml-7 text-foreground-secondary">
                      {overview.totalMatches}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm dark:bg-card-dark dark:border-border-dark overflow-hidden">
              <div className="bg-gray-600 text-white px-4 py-3">
                <h5 className="text-base font-semibold m-0">Highlights</h5>
              </div>
              <div className="divide-y divide-border dark:divide-border-dark">
                {overview.highlights.map((highlight, index) => (
                  <div key={index} className="px-4 py-3 text-foreground">
                    <span className="inline-flex items-center rounded-full bg-primary-500 text-white text-xs font-medium px-2.5 py-0.5 mr-2">
                      {index + 1}
                    </span>
                    {highlight}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-xl border border-green-500 bg-green-500/10 shadow-sm overflow-hidden">
              <div className="bg-green-600 text-white px-4 py-3 flex items-center gap-2">
                <FaTrophy />
                Champion
              </div>
              <div className="p-5 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-3">
                  {overview.winner}
                </h2>
                {overview.runnerUp && (
                  <>
                    <hr className="border-border dark:border-border-dark" />
                    <div className="text-foreground-secondary mt-3">
                      <small>Runner-Up</small>
                    </div>
                    <h4 className="text-xl font-semibold text-foreground mt-2">
                      {overview.runnerUp}
                    </h4>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bracket Tab */}
      {activeTab === "bracket" && (
        <div className="rounded-xl border border-border bg-card shadow-sm dark:bg-card-dark dark:border-border-dark overflow-hidden">
          <div className="px-4 py-3 border-b border-border dark:border-border-dark">
            <h5 className="text-base font-semibold m-0 text-foreground">
              Tournament Bracket
            </h5>
          </div>
          <div className="p-5">
            <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 px-4 py-3 mb-4">
              <strong>Note:</strong> This is a placeholder visualization. Real
              tournament data will be integrated in a future phase.
            </div>
            <D3Bracket data={placeholderBracketData} width={900} height={500} />
          </div>
        </div>
      )}

      {/* Standings Tab */}
      {activeTab === "standings" && (
        <div className="rounded-xl border border-border bg-card shadow-sm dark:bg-card-dark dark:border-border-dark overflow-hidden">
          <div className="px-4 py-3 border-b border-border dark:border-border-dark">
            <h5 className="text-base font-semibold m-0 text-foreground">
              Final Standings
            </h5>
          </div>
          <div className="p-5">
            <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 px-4 py-3 mb-4">
              <strong>Note:</strong> Placeholder data shown. Real standings will
              be loaded from Firestore in a future phase.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-border-dark">
                    <th className="text-left px-3 py-2 font-semibold text-foreground">
                      #
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-foreground">
                      Player
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-foreground">
                      Wins
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-foreground">
                      Losses
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-foreground">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {placeholderStandings.map((row) => (
                    <tr
                      key={row.rank}
                      className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <td className="px-3 py-2 text-foreground">
                        {row.rank === 1 && (
                          <FaTrophy className="inline text-yellow-500 mr-1" />
                        )}
                        {row.rank}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 text-foreground",
                          row.rank === 1 && "font-bold",
                        )}
                      >
                        {row.player}
                      </td>
                      <td className="px-3 py-2 text-foreground">{row.wins}</td>
                      <td className="px-3 py-2 text-foreground">
                        {row.losses}
                      </td>
                      <td className="px-3 py-2 text-foreground">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Runs Tab */}
      {activeTab === "runs" && (
        <div className="rounded-xl border border-border bg-card shadow-sm dark:bg-card-dark dark:border-border-dark overflow-hidden">
          <div className="px-4 py-3 border-b border-border dark:border-border-dark">
            <h5 className="text-base font-semibold m-0 text-foreground">
              Tournament Runs
            </h5>
          </div>
          <div className="p-5">
            <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 px-4 py-3 mb-4">
              <strong>Note:</strong> Placeholder data shown. Real run data will
              be loaded from Firestore in a future phase.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-border-dark">
                    <th className="text-left px-3 py-2 font-semibold text-foreground">
                      Run ID
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-foreground">
                      Player
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-foreground">
                      Map
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-foreground">
                      Score
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-foreground">
                      Time
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {placeholderRuns.map((run) => (
                    <tr
                      key={run.id}
                      className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <td className="px-3 py-2 text-foreground">#{run.id}</td>
                      <td className="px-3 py-2 text-foreground">
                        {run.player}
                      </td>
                      <td className="px-3 py-2 text-foreground">{run.map}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center rounded-full bg-primary-500 text-white text-xs font-medium px-2.5 py-0.5">
                          {run.score}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-foreground">{run.time}</td>
                      <td className="px-3 py-2 text-foreground">{run.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </TourneyPage>
  );
}

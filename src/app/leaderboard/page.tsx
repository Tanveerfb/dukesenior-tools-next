"use client";

import { useState, useEffect } from "react";
import { FiAward, FiTrendingUp, FiStar } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { LevelBadge } from "@/components/gamification";
import type { LeaderboardEntry, LeaderboardSort } from "@/types/gamification";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<LeaderboardSort>("xp");

  useEffect(() => {
    fetchLeaderboard();
  }, [sort]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/gamification/leaderboard?sort=${sort}&limit=100`,
      );
      if (response.ok) {
        const data = await response.json();
        setEntries(data.leaderboard);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <FiAward className="text-[#FFD700]" size={20} />;
    if (rank === 2) return <FiAward className="text-[#C0C0C0]" size={20} />;
    if (rank === 3) return <FiAward className="text-[#CD7F32]" size={20} />;
    return <span className="text-sm font-bold text-foreground">#{rank}</span>;
  };

  const sortOptions: {
    value: LeaderboardSort;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { value: "xp", label: "Total XP", icon: <FiTrendingUp className="mr-1" /> },
    { value: "level", label: "Level", icon: <FiStar className="mr-1" /> },
    {
      value: "achievements",
      label: "Achievements",
      icon: <FiAward className="mr-1" />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          🏆 Leaderboard
        </h1>
        <p className="text-foreground-secondary">
          Compete with other members and climb to the top!
        </p>
      </div>

      {/* Sort Controls */}
      <div className="mb-6 flex justify-center">
        <div
          className="inline-flex rounded-lg border border-border dark:border-border-dark overflow-hidden"
          role="group"
          aria-label="sort leaderboard"
        >
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-label={`sort by ${opt.value}`}
              onClick={() => setSort(opt.value)}
              className={cn(
                "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors",
                "border-r border-border dark:border-border-dark last:border-r-0",
                sort === opt.value
                  ? "bg-primary-500 text-white"
                  : "bg-card dark:bg-card-dark text-foreground hover:bg-gray-100 dark:hover:bg-gray-700",
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="px-4 py-3 text-sm font-bold text-foreground">
                  Rank
                </th>
                <th className="px-4 py-3 text-sm font-bold text-foreground">
                  User
                </th>
                <th className="px-4 py-3 text-sm font-bold text-foreground text-center">
                  Level
                </th>
                <th className="px-4 py-3 text-sm font-bold text-foreground text-right">
                  Total XP
                </th>
                <th className="px-4 py-3 text-sm font-bold text-foreground text-right">
                  Achievements
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.uid}
                  className={cn(
                    "border-b border-border dark:border-border-dark last:border-b-0 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800",
                    entry.rank <= 3 && "bg-yellow-500/5",
                  )}
                >
                  {/* Rank */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {getRankIcon(entry.rank)}
                    </div>
                  </td>

                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {entry.photoURL ? (
                        <img
                          src={entry.photoURL}
                          alt={entry.displayName || entry.username || ""}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white text-sm font-bold">
                          {(entry.displayName || entry.username || "A")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {entry.displayName || entry.username || "Anonymous"}
                        </p>
                        {entry.username && (
                          <p className="text-xs text-foreground-secondary">
                            @{entry.username}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Level */}
                  <td className="px-4 py-3 text-center">
                    <LevelBadge
                      level={entry.currentLevel}
                      size="small"
                      variant="icon-only"
                      totalXP={entry.totalXP}
                    />
                  </td>

                  {/* Total XP */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-foreground">
                      {entry.totalXP.toLocaleString()}
                    </span>
                  </td>

                  {/* Achievements */}
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center rounded-full border border-primary-500 px-2.5 py-0.5 text-xs font-medium text-primary-500">
                      {entry.achievementCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && entries.length === 0 && (
        <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow p-16 text-center">
          <h2 className="text-lg font-semibold text-foreground-secondary">
            No leaderboard data available yet
          </h2>
          <p className="text-sm text-foreground-secondary mt-2">
            Be the first to earn XP and climb the leaderboard!
          </p>
        </div>
      )}
    </div>
  );
}

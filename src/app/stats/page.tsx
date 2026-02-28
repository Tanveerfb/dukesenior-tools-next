"use client";

import { useState, useEffect } from "react";
import {
  FiTrendingUp,
  FiAward,
  FiUsers,
  FiMessageSquare,
  FiEdit,
  FiMessageCircle,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  XPProgressBar,
  LevelBadge,
  AchievementList,
} from "@/components/gamification";
import type { UserGamification } from "@/types/gamification";

export default function StatsPage() {
  const { user } = useAuth();
  const [gamification, setGamification] = useState<UserGamification | null>(
    null,
  );
  const [rank, setRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (user?.uid) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/gamification/stats/${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setGamification(data.gamification);
        setRank(data.rank);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!gamification) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow dark:border-border-dark dark:bg-card-dark">
          <h2 className="text-lg font-semibold text-foreground dark:text-foreground">
            No stats available yet
          </h2>
          <p className="mt-2 text-sm text-foreground-secondary">
            Start earning XP to see your stats!
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total XP",
      value: gamification.totalXP.toLocaleString(),
      icon: <FiTrendingUp className="text-xl" />,
      color: "#4CAF50",
    },
    {
      title: "Global Rank",
      value: `#${rank}`,
      icon: <FiAward className="text-xl" />,
      color: "#FFD700",
    },
    {
      title: "Achievements",
      value: gamification.achievementsUnlocked.length,
      icon: <FiAward className="text-xl" />,
      color: "#9C27B0",
    },
    {
      title: "Login Streak",
      value: `${gamification.stats.loginStreak} days`,
      icon: <FiTrendingUp className="text-xl" />,
      color: "#FF9800",
    },
  ];

  const activityStats = [
    {
      label: "Posts Created",
      value: gamification.stats.postsCreated,
      icon: <FiEdit className="text-lg" />,
      color: "#E91E63",
    },
    {
      label: "Comments Posted",
      value: gamification.stats.commentsPosted,
      icon: <FiMessageCircle className="text-lg" />,
      color: "#03A9F4",
    },
    {
      label: "Messages Sent",
      value: gamification.stats.messagesSent,
      icon: <FiMessageSquare className="text-lg" />,
      color: "#2196F3",
    },
    {
      label: "Friends Added",
      value: gamification.stats.friendsAdded,
      icon: <FiUsers className="text-lg" />,
      color: "#4CAF50",
    },
    {
      label: "Tournaments Participated",
      value: gamification.stats.tournamentsParticipated,
      icon: <FiAward className="text-lg" />,
      color: "#FF5722",
    },
    {
      label: "Tournaments Won",
      value: gamification.stats.tournamentsWon,
      icon: <FiAward className="text-lg" />,
      color: "#FFD700",
    },
  ];

  const tabs = ["Activity Stats", "Achievements"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">📊 My Stats</h1>
        <p className="text-base text-foreground-secondary">
          Track your progress and achievements
        </p>
      </div>

      {/* Level & XP Overview */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6 shadow dark:border-border-dark dark:bg-card-dark">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-3 text-center">
            <LevelBadge
              level={gamification.currentLevel}
              totalXP={gamification.totalXP}
              size="large"
              showTitle={true}
            />
          </div>
          <div className="md:col-span-9">
            <XPProgressBar
              currentXP={gamification.totalXP}
              xpInLevel={gamification.xpInCurrentLevel}
              xpForNextLevel={gamification.xpForNextLevel}
              currentLevel={gamification.currentLevel}
              variant="default"
              showLabel={true}
            />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-card shadow dark:border-border-dark dark:bg-card-dark"
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: stat.color }}>{stat.icon}</span>
                <span className="text-sm text-foreground-secondary">
                  {stat.title}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-border bg-card shadow mb-4 dark:border-border-dark dark:bg-card-dark">
        <div className="flex">
          {tabs.map((label, index) => (
            <button
              key={index}
              onClick={() => setTabValue(index)}
              className={cn(
                "flex-1 py-3 px-4 text-sm font-medium transition-colors text-center",
                "border-b-2",
                tabValue === index
                  ? "border-primary-500 text-primary-500"
                  : "border-transparent text-foreground-secondary hover:text-foreground hover:border-border dark:hover:border-border-dark",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tabValue === 0 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow dark:border-border-dark dark:bg-card-dark">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Activity Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activityStats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg bg-black/5 p-3 dark:bg-white/5"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: stat.color }}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">
                    {stat.label}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tabValue === 1 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow dark:border-border-dark dark:bg-card-dark">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Achievements ({gamification.achievementsUnlocked.length} Unlocked)
          </h2>
          <AchievementList
            userAchievements={gamification.achievementsUnlocked}
            userStats={{
              posts_created: gamification.stats.postsCreated,
              comments_posted: gamification.stats.commentsPosted,
              messages_sent: gamification.stats.messagesSent,
              friends_added: gamification.stats.friendsAdded,
              tournaments_participated:
                gamification.stats.tournamentsParticipated,
              tournaments_won: gamification.stats.tournamentsWon,
              login_streak: gamification.stats.loginStreak,
              total_logins: gamification.stats.totalLogins,
              level_reached: gamification.currentLevel,
              xp_earned: gamification.totalXP,
            }}
          />
        </div>
      )}
    </div>
  );
}

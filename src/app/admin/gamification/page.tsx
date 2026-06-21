"use client";

import { useState, useEffect, useRef } from "react";
import { FiPlus, FiTrendingUp, FiAward, FiUsers, FiX } from "react-icons/fi";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { ACHIEVEMENTS } from "@/data/achievements";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/types/gamification";

function AdminGamificationPage() {
  const { admin } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [xpAmount, setXpAmount] = useState(0);
  const [xpReason, setXpReason] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalXPAwarded: 0,
    totalAchievements: 0,
  });

  // Autocomplete state
  const [achQuery, setAchQuery] = useState("");
  const [achOpen, setAchOpen] = useState(false);
  const achRef = useRef<HTMLDivElement>(null);

  const filteredAchievements = ACHIEVEMENTS.filter(
    (a) =>
      a.name.toLowerCase().includes(achQuery.toLowerCase()) ||
      (a.icon?.includes(achQuery) ?? false),
  );

  // Close autocomplete on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (achRef.current && !achRef.current.contains(e.target as Node)) {
        setAchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleAwardAchievement = async () => {
    if (!selectedUser || !selectedAchievement) return;

    try {
      const response = await fetch(
        "/api/admin/gamification/award-achievement",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: selectedUser,
            achievementId: selectedAchievement.id,
          }),
        },
      );

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Achievement awarded successfully!",
        });
        setOpenDialog(false);
        setSelectedUser("");
        setSelectedAchievement(null);
        setAchQuery("");
      } else {
        const data = await response.json();
        setMessage({
          type: "error",
          text: data.error || "Failed to award achievement",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to award achievement" });
    }
  };

  const handleAwardXP = async () => {
    if (!selectedUser || xpAmount <= 0 || !xpReason) return;

    try {
      const response = await fetch("/api/admin/gamification/award-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: selectedUser,
          amount: xpAmount,
          reason: xpReason,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "XP awarded successfully!" });
        setSelectedUser("");
        setXpAmount(0);
        setXpReason("");
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "Failed to award XP" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to award XP" });
    }
  };

  // Group achievements by category
  const achievementsByCategory = {
    social: ACHIEVEMENTS.filter((a) => a.category === "social"),
    content: ACHIEVEMENTS.filter((a) => a.category === "content"),
    tournament: ACHIEVEMENTS.filter((a) => a.category === "tournament"),
    milestone: ACHIEVEMENTS.filter((a) => a.category === "milestone"),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Gamification Admin
        </h1>
        <p className="text-base text-muted-foreground">
          Manage achievements, award XP, and view analytics
        </p>
      </div>

      {message && (
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border px-4 py-3 mb-6 text-sm",
            message.type === "success"
              ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
              : "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400",
          )}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-4 hover:opacity-70"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-card dark:bg-card-dark p-5">
          <div className="flex items-center gap-2 mb-2">
            <FiUsers className="h-5 w-5 text-green-500" />
            <span className="text-sm text-muted-foreground">Total Users</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats.totalUsers}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card dark:bg-card-dark p-5">
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-muted-foreground">
              Total XP Awarded
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats.totalXPAwarded.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card dark:bg-card-dark p-5">
          <div className="flex items-center gap-2 mb-2">
            <FiAward className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-muted-foreground">
              Total Achievements
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats.totalAchievements}
          </p>
        </div>
      </div>

      {/* Award Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-card dark:bg-card-dark p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Award Achievement
          </h3>
          <button
            onClick={() => setOpenDialog(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
          >
            <FiPlus className="h-4 w-4" />
            Award Achievement to User
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card dark:bg-card-dark p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Award Manual XP
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                User ID
              </label>
              <input
                type="text"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                XP Amount
              </label>
              <input
                type="number"
                value={xpAmount}
                onChange={(e) => setXpAmount(parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Reason
              </label>
              <input
                type="text"
                value={xpReason}
                onChange={(e) => setXpReason(e.target.value)}
                className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={handleAwardXP}
              disabled={!selectedUser || xpAmount <= 0 || !xpReason}
              className="w-full rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Award XP
            </button>
          </div>
        </div>
      </div>

      {/* Achievement List */}
      <div className="rounded-xl border border-border bg-card dark:bg-card-dark p-6">
        <h3 className="text-lg font-bold text-foreground mb-6">
          All Achievements ({ACHIEVEMENTS.length})
        </h3>
        {Object.entries(achievementsByCategory).map(
          ([category, achievements]) => (
            <div key={category} className="mb-6">
              <h4 className="text-base font-bold text-foreground mb-3 capitalize">
                {category} ({achievements.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{achievement.icon}</span>
                      <span className="text-sm font-bold text-foreground">
                        {achievement.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-foreground">
                        {achievement.rarity}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-primary-500 text-primary-500 px-2 py-0.5 text-[0.65rem] font-medium">
                        {achievement.xpReward} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
        )}
      </div>

      {/* Award Achievement Dialog (Modal) */}
      {openDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setOpenDialog(false)}
        >
          <div
            className="w-full max-w-md mx-4 rounded-xl border border-border bg-card dark:bg-card-dark shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-2">
              <h2 className="text-lg font-bold text-foreground">
                Award Achievement
              </h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Autocomplete replacement */}
              <div ref={achRef} className="relative">
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Select Achievement
                </label>
                <input
                  type="text"
                  value={
                    selectedAchievement && !achOpen
                      ? `${selectedAchievement.icon} ${selectedAchievement.name}`
                      : achQuery
                  }
                  onFocus={() => {
                    setAchOpen(true);
                    if (selectedAchievement) {
                      setAchQuery(
                        `${selectedAchievement.icon} ${selectedAchievement.name}`,
                      );
                    }
                  }}
                  onChange={(e) => {
                    setAchQuery(e.target.value);
                    setAchOpen(true);
                    if (!e.target.value) setSelectedAchievement(null);
                  }}
                  placeholder="Search achievements..."
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {achOpen && (
                  <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-card dark:bg-card-dark shadow-lg">
                    {filteredAchievements.length === 0 ? (
                      <li className="px-3 py-2 text-sm text-muted-foreground">
                        No results
                      </li>
                    ) : (
                      filteredAchievements.map((a) => (
                        <li
                          key={a.id}
                          onClick={() => {
                            setSelectedAchievement(a);
                            setAchQuery(`${a.icon} ${a.name}`);
                            setAchOpen(false);
                          }}
                          className={cn(
                            "cursor-pointer px-3 py-2 text-sm text-foreground hover:bg-muted",
                            selectedAchievement?.id === a.id && "bg-muted",
                          )}
                        >
                          {a.icon} {a.name}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              {selectedAchievement && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm text-foreground">
                    {selectedAchievement.description}
                  </p>
                  <span className="block mt-1 text-xs text-muted-foreground">
                    Reward: {selectedAchievement.xpReward} XP
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
              <button
                onClick={() => setOpenDialog(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAwardAchievement}
                disabled={!selectedUser || !selectedAchievement}
                className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Award Achievement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminGamificationPageWithGuard() {
  return (
    <AdminAuthGuard>
      <AdminGamificationPage />
    </AdminAuthGuard>
  );
}

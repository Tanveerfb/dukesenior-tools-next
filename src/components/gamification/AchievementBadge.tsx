"use client";

import { cn } from "@/lib/utils";
import { FiLock } from "react-icons/fi";
import type { Achievement } from "@/types/gamification";
import { ACHIEVEMENTS } from "@/data/achievements";

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: number;
  size?: "small" | "medium" | "large";
  showProgress?: boolean;
  progress?: number;
}

export function AchievementBadge({
  achievement,
  unlocked,
  unlockedAt,
  size = "medium",
  showProgress = false,
  progress = 0,
}: AchievementBadgeProps) {
  const getRarityColor = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "legendary":
        return "#FFD700";
      case "epic":
        return "#9C27B0";
      case "rare":
        return "#2196F3";
      case "uncommon":
        return "#4CAF50";
      case "common":
        return "#9E9E9E";
      default:
        return "#9E9E9E";
    }
  };

  const sizeConfig = {
    small: { iconSize: "text-3xl", fontSize: "text-xs" },
    medium: { iconSize: "text-5xl", fontSize: "text-sm" },
    large: { iconSize: "text-6xl", fontSize: "text-base" },
  };

  const config = sizeConfig[size];
  const rarityColor = getRarityColor(achievement.rarity);

  const tooltipContent = [
    achievement.name,
    achievement.description,
    `Rarity: ${achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}`,
    `Reward: ${achievement.xpReward} XP`,
    unlocked && unlockedAt
      ? `Unlocked: ${new Date(unlockedAt).toLocaleDateString()}`
      : null,
    showProgress && !unlocked
      ? `Progress: ${progress}/${achievement.requirement}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div
      title={tooltipContent}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300",
        unlocked
          ? "bg-card hover:-translate-y-1 dark:bg-card-dark"
          : "border-transparent bg-black/20 opacity-50",
      )}
      style={{
        borderColor: unlocked ? rarityColor : "transparent",
      }}
    >
      <div className="p-4 text-center">
        {/* Icon/Emoji */}
        <div
          className={cn(
            "relative mb-2",
            config.iconSize,
            !unlocked && "grayscale",
          )}
        >
          {unlocked ? (
            achievement.icon || "🏆"
          ) : achievement.isSecret ? (
            "❓"
          ) : (
            <span className="relative inline-block">
              {achievement.icon || "🏆"}
              <FiLock className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-foreground-secondary" />
            </span>
          )}
        </div>

        {/* Name */}
        <p
          className={cn(
            "mb-1 truncate font-bold",
            size === "small" ? "text-xs" : "text-sm",
          )}
        >
          {unlocked
            ? achievement.name
            : achievement.isSecret
              ? "Secret Achievement"
              : achievement.name}
        </p>

        {/* Rarity Badge */}
        {unlocked && (
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[0.65rem] font-medium"
            style={{
              backgroundColor: rarityColor,
              color: achievement.rarity === "legendary" ? "#000" : "#FFF",
            }}
          >
            {achievement.rarity}
          </span>
        )}

        {/* Progress Bar */}
        {showProgress && !unlocked && (
          <div className="mt-2 w-full">
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(progress / achievement.requirement) * 100}%`,
                  backgroundColor: rarityColor,
                }}
              />
            </div>
            <span className="mt-1 text-[0.65rem] opacity-70">
              {progress}/{achievement.requirement}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface AchievementListProps {
  userAchievements: string[];
  userStats?: Record<string, number>;
  filter?: "all" | "unlocked" | "locked" | Achievement["category"];
}

export function AchievementList({
  userAchievements,
  userStats = {},
  filter = "all",
}: AchievementListProps) {
  const filteredAchievements = ACHIEVEMENTS.filter((achievement) => {
    const isUnlocked = userAchievements.includes(achievement.id);
    if (filter === "unlocked") return isUnlocked;
    if (filter === "locked") return !isUnlocked;
    if (filter !== "all" && filter !== achievement.category) return false;
    return true;
  });

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {filteredAchievements.map((achievement) => {
        const isUnlocked = userAchievements.includes(achievement.id);
        const statKey = achievement.trigger;
        const progress = userStats[statKey] || 0;

        return (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            unlocked={isUnlocked}
            showProgress={!isUnlocked}
            progress={progress}
          />
        );
      })}
    </div>
  );
}

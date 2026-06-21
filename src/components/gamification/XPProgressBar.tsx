"use client";

import { cn } from "@/lib/utils";
import { getLevelTitle } from "@/types/gamification";

interface XPProgressBarProps {
  currentXP: number;
  xpInLevel: number;
  xpForNextLevel: number;
  currentLevel: number;
  variant?: "default" | "compact";
  showLabel?: boolean;
}

export function XPProgressBar({
  currentXP,
  xpInLevel,
  xpForNextLevel,
  currentLevel,
  variant = "default",
  showLabel = true,
}: XPProgressBarProps) {
  const percentage =
    xpForNextLevel > 0 ? (xpInLevel / xpForNextLevel) * 100 : 100;
  const isMaxLevel = currentLevel >= 100;

  if (variant === "compact") {
    return (
      <div
        title={
          isMaxLevel
            ? "Max Level Reached!"
            : `${xpInLevel.toLocaleString()} / ${xpForNextLevel.toLocaleString()} XP`
        }
        className="w-full"
      >
        <div className="h-2 w-full overflow-hidden rounded bg-white/10">
          <div
            className={cn(
              "h-full rounded transition-all duration-500",
              isMaxLevel ? "bg-yellow-400" : "bg-green-500",
            )}
            style={{ width: `${isMaxLevel ? 100 : percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex justify-between">
          <span className="text-sm text-foreground-secondary">
            {isMaxLevel
              ? "Max Level"
              : `Level ${currentLevel} - ${getLevelTitle(currentLevel)}`}
          </span>
          <span className="text-sm text-foreground-secondary">
            {isMaxLevel
              ? `${currentXP.toLocaleString()} Total XP`
              : `${xpInLevel.toLocaleString()} / ${xpForNextLevel.toLocaleString()} XP`}
          </span>
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-lg bg-white/10">
        <div
          className={cn(
            "h-full rounded-lg transition-all duration-500",
            isMaxLevel
              ? "bg-gradient-to-r from-yellow-500 to-orange-500"
              : "bg-gradient-to-r from-green-500 to-green-300",
          )}
          style={{ width: `${isMaxLevel ? 100 : percentage}%` }}
        />
      </div>
      {!showLabel && (
        <span className="mt-1 block text-xs text-foreground-secondary">
          {isMaxLevel
            ? "Maximum level reached!"
            : `${percentage.toFixed(1)}% to level ${currentLevel + 1}`}
        </span>
      )}
    </div>
  );
}

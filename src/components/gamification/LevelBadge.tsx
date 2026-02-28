"use client";

import { cn } from "@/lib/utils";
import { FiStar } from "react-icons/fi";
import { getLevelTitle } from "@/types/gamification";

interface LevelBadgeProps {
  level: number;
  totalXP?: number;
  size?: "small" | "medium" | "large";
  showTitle?: boolean;
  variant?: "default" | "compact" | "icon-only";
}

export function LevelBadge({
  level,
  totalXP,
  size = "medium",
  showTitle = true,
  variant = "default",
}: LevelBadgeProps) {
  const title = getLevelTitle(level);

  const getColor = () => {
    if (level >= 90)
      return { bg: "#FFD700", text: "#000", ring: "ring-yellow-400/30" };
    if (level >= 75)
      return { bg: "#9C27B0", text: "#FFF", ring: "ring-purple-400/30" };
    if (level >= 60)
      return { bg: "#2196F3", text: "#FFF", ring: "ring-blue-400/30" };
    if (level >= 45)
      return { bg: "#FF9800", text: "#FFF", ring: "ring-orange-400/30" };
    if (level >= 30)
      return { bg: "#4CAF50", text: "#FFF", ring: "ring-green-400/30" };
    if (level >= 20)
      return { bg: "#00BCD4", text: "#FFF", ring: "ring-cyan-400/30" };
    if (level >= 10)
      return { bg: "#607D8B", text: "#FFF", ring: "ring-gray-400/30" };
    if (level >= 5)
      return { bg: "#795548", text: "#FFF", ring: "ring-amber-700/30" };
    return { bg: "#9E9E9E", text: "#FFF", ring: "ring-gray-400/30" };
  };

  const colors = getColor();

  const sizeConfig = {
    small: { dim: "h-8 w-8", text: "text-xs", icon: "h-4 w-4" },
    medium: { dim: "h-12 w-12", text: "text-base", icon: "h-5 w-5" },
    large: { dim: "h-16 w-16", text: "text-xl", icon: "h-7 w-7" },
  };

  const config = sizeConfig[size];
  const tooltipText = `Level ${level} - ${title}${totalXP ? ` (${totalXP.toLocaleString()} XP)` : ""}`;

  if (variant === "icon-only") {
    return (
      <div
        title={tooltipText}
        className={cn(
          "flex items-center justify-center rounded-full font-bold shadow-md ring-2 transition-transform hover:scale-110",
          config.dim,
          config.text,
          colors.ring,
        )}
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {level}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold",
          size === "small" ? "text-xs" : "text-sm",
        )}
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        <FiStar className={config.icon} />
        Lv. {level}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        title={totalXP ? `${totalXP.toLocaleString()} Total XP` : undefined}
        className={cn(
          "relative flex items-center justify-center rounded-full font-bold shadow-lg ring-[3px] transition-transform",
          config.dim,
          config.text,
          colors.ring,
          totalXP && "cursor-pointer hover:scale-105",
        )}
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {level}
        {level >= 90 && (
          <FiStar className="absolute -right-1 -top-1 h-4 w-4 text-white" />
        )}
      </div>
      {showTitle && (
        <span
          className="text-center text-xs font-bold"
          style={{ color: colors.bg }}
        >
          {title}
        </span>
      )}
    </div>
  );
}

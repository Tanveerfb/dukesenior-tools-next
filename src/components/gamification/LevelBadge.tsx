"use client";

import { Box, Typography, Chip, Tooltip } from "@mui/material";
import { StarOutline, Star } from "@mui/icons-material";
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

  // Color scheme based on level
  const getColor = () => {
    if (level >= 90) return { bg: "#FFD700", text: "#000" }; // Legendary - Gold
    if (level >= 75) return { bg: "#9C27B0", text: "#FFF" }; // Master - Purple
    if (level >= 60) return { bg: "#2196F3", text: "#FFF" }; // Expert - Blue
    if (level >= 45) return { bg: "#FF9800", text: "#FFF" }; // Veteran - Orange
    if (level >= 30) return { bg: "#4CAF50", text: "#FFF" }; // Skilled - Green
    if (level >= 20) return { bg: "#00BCD4", text: "#FFF" }; // Proficient - Cyan
    if (level >= 10) return { bg: "#607D8B", text: "#FFF" }; // Intermediate - Grey
    if (level >= 5) return { bg: "#795548", text: "#FFF" }; // Apprentice - Brown
    return { bg: "#9E9E9E", text: "#FFF" }; // Novice - Grey
  };

  const colors = getColor();

  // Size configuration
  const sizeConfig = {
    small: { width: 32, height: 32, fontSize: "0.75rem", iconSize: 16 },
    medium: { width: 48, height: 48, fontSize: "1rem", iconSize: 20 },
    large: { width: 64, height: 64, fontSize: "1.25rem", iconSize: 28 },
  };

  const config = sizeConfig[size];

  if (variant === "icon-only") {
    return (
      <Tooltip
        title={`Level ${level} - ${title}${totalXP ? ` (${totalXP.toLocaleString()} XP)` : ""}`}
        arrow
      >
        <Box
          sx={{
            width: config.width,
            height: config.height,
            borderRadius: "50%",
            backgroundColor: colors.bg,
            color: colors.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: config.fontSize,
            cursor: "pointer",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            transition: "transform 0.2s",
            "&:hover": {
              transform: "scale(1.1)",
            },
          }}
        >
          {level}
        </Box>
      </Tooltip>
    );
  }

  if (variant === "compact") {
    return (
      <Chip
        icon={
          <Star
            sx={{
              fontSize: config.iconSize,
              color: `${colors.text} !important`,
            }}
          />
        }
        label={`Lv. ${level}`}
        size={size === "large" ? "medium" : size}
        sx={{
          backgroundColor: colors.bg,
          color: colors.text,
          fontWeight: "bold",
          "& .MuiChip-icon": {
            color: colors.text,
          },
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      <Tooltip
        title={totalXP ? `${totalXP.toLocaleString()} Total XP` : ""}
        arrow
      >
        <Box
          sx={{
            width: config.width,
            height: config.height,
            borderRadius: "50%",
            backgroundColor: colors.bg,
            color: colors.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: config.fontSize,
            border: "3px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            position: "relative",
            cursor: totalXP ? "pointer" : "default",
            transition: "transform 0.2s",
            "&:hover": {
              transform: totalXP ? "scale(1.05)" : "none",
            },
          }}
        >
          {level}
          {level >= 90 && (
            <Star
              sx={{
                position: "absolute",
                top: -4,
                right: -4,
                fontSize: 16,
                color: "#FFF",
              }}
            />
          )}
        </Box>
      </Tooltip>
      {showTitle && (
        <Typography
          variant="caption"
          sx={{
            fontWeight: "bold",
            color: colors.bg,
            textAlign: "center",
          }}
        >
          {title}
        </Typography>
      )}
    </Box>
  );
}

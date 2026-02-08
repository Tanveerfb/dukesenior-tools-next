"use client";
import React from "react";
import Image from "next/image";
import type { UserDoc } from "@/lib/services/users";

interface UserAvatarProps {
  user: Partial<UserDoc>;
  size?: "small" | "medium" | "large" | "xlarge";
  showStatus?: boolean;
  onClick?: () => void;
  className?: string;
}

const sizeMap = {
  small: 32,
  medium: 48,
  large: 96,
  xlarge: 128,
};

export default function UserAvatar({
  user,
  size = "medium",
  showStatus = false,
  onClick,
  className = "",
}: UserAvatarProps) {
  const dimension = sizeMap[size];
  const accentColor = user.accentColor || "#5865F2";
  const displayName = user.displayName || user.username || "User";
  const username = user.username || "";
  const photoURL = user.photoURL;
  
  // Get initials for fallback
  const getInitials = () => {
    if (displayName) {
      const parts = displayName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return displayName.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const initials = getInitials();

  return (
    <div
      className={`position-relative ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      style={{
        width: dimension,
        height: dimension,
      }}
      title={username ? `${displayName} (@${username})` : displayName}
    >
      {/* Avatar container with accent color border */}
      <div
        style={{
          width: dimension,
          height: dimension,
          borderRadius: "50%",
          overflow: "hidden",
          border: `3px solid ${accentColor}`,
          background: "#e9ecef",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: `${dimension / 2.5}px`,
          fontWeight: 600,
          color: "#495057",
        }}
      >
        {photoURL ? (
          <Image
            src={photoURL}
            alt={displayName}
            fill
            style={{ objectFit: "cover" }}
            sizes={`${dimension}px`}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Status ring (placeholder - gray for now) */}
      {showStatus && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: dimension * 0.3,
            height: dimension * 0.3,
            borderRadius: "50%",
            background: "#6c757d", // gray/offline
            border: "2px solid white",
          }}
          title="Offline"
        />
      )}
    </div>
  );
}

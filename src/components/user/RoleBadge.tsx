"use client";
import React from "react";

interface RoleBadgeProps {
  role: string;
  className?: string;
}

const roleColors: Record<string, string> = {
  admin: "#ED4245",
  moderator: "#57F287",
  verified: "#5865F2",
  // Add more role colors as needed
};

export default function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  const color = roleColors[role.toLowerCase()] || "#6c757d";
  
  return (
    <span
      className={`badge ${className}`}
      style={{
        background: color,
        color: "white",
        fontSize: "0.75rem",
        padding: "0.25rem 0.5rem",
        borderRadius: "12px",
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {role}
    </span>
  );
}

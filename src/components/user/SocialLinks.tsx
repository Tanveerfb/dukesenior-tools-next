"use client";
import React from "react";
import { FaDiscord, FaTwitch, FaTwitter, FaYoutube } from "react-icons/fa";
import type { UserDoc } from "@/lib/services/users";

interface SocialLinksProps {
  socialLinks?: UserDoc["socialLinks"];
  className?: string;
}

export default function SocialLinks({ socialLinks, className = "" }: SocialLinksProps) {
  if (!socialLinks || Object.keys(socialLinks).length === 0) {
    return null;
  }

  const links = [
    { key: "discord", icon: FaDiscord, color: "#5865F2", label: "Discord" },
    { key: "twitch", icon: FaTwitch, color: "#9146FF", label: "Twitch" },
    { key: "twitter", icon: FaTwitter, color: "#1DA1F2", label: "Twitter" },
    { key: "youtube", icon: FaYoutube, color: "#FF0000", label: "YouTube" },
  ];

  return (
    <div className={`d-flex gap-2 ${className}`}>
      {links.map(({ key, icon: Icon, color, label }) => {
        const url = socialLinks[key as keyof typeof socialLinks];
        if (!url) return null;

        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none"
            style={{
              color: color,
              fontSize: "1.5rem",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            title={label}
          >
            <Icon />
          </a>
        );
      })}
    </div>
  );
}

"use client";
import React from "react";
import Image from "next/image";
import { Button } from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/user/UserAvatar";
import RoleBadge from "@/components/user/RoleBadge";
import SocialLinks from "@/components/user/SocialLinks";
import type { UserDoc } from "@/lib/services/users";

interface Props {
  uid?: string;
  username?: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  createdAt?: number;
  lastSeen?: number;
  signInCount?: number;
  bannerURL?: string;
  accentColor?: string;
  pronouns?: string;
  location?: string;
  timezone?: string;
  socialLinks?: UserDoc["socialLinks"];
  roles?: string[];
}

export default function ProfileHeader({
  uid,
  username,
  displayName,
  photoURL,
  bio,
  createdAt,
  lastSeen,
  signInCount: _signInCount,
  bannerURL,
  accentColor = "#5865F2",
  pronouns,
  location,
  timezone,
  socialLinks,
  roles = [],
}: Props) {
  const { user } = useAuth();
  const isOwner = !!(user?.uid && uid && user.uid === uid);
  const router = useRouter();

  function toMillis(v?: any) {
    if (!v) return null;
    if (typeof v === "number") return v;
    if (v && typeof v.toMillis === "function") return v.toMillis();
    if (typeof v === "string") {
      const p = Date.parse(v);
      if (!Number.isNaN(p)) return p;
    }
    return null;
  }

  const ms = toMillis(createdAt as any);
  const memberSince = ms ? new Date(ms).toLocaleDateString() : null;
  const lastSeenMs = toMillis(lastSeen as any) || null;

  const userProfile: Partial<UserDoc> = {
    uid,
    username,
    displayName,
    photoURL,
    accentColor,
  };

  // Fallback gradient for banner
  const bannerStyle = bannerURL
    ? { backgroundImage: `url(${bannerURL})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(135deg, ${accentColor}99, ${accentColor}33)` };

  return (
    <div className="card mb-4" style={{ overflow: "hidden" }}>
      {/* Banner Section */}
      <div
        style={{
          height: 200,
          width: "100%",
          position: "relative",
          borderBottom: `4px solid ${accentColor}`,
          ...bannerStyle,
        }}
      />

      <div className="card-body" style={{ marginTop: -48 }}>
        <div className="d-flex flex-column flex-md-row align-items-start">
          {/* Avatar overlapping banner */}
          <div className="me-3 mb-3 mb-md-0" style={{ marginTop: -48 }}>
            <UserAvatar user={userProfile} size="xlarge" showStatus />
          </div>

          <div className="flex-grow-1 w-100">
            <div className="d-flex align-items-start justify-content-between flex-wrap">
              <div className="mb-2">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h2 className="mb-0">{displayName || username}</h2>
                  {roles && roles.length > 0 && (
                    <div className="d-flex gap-1">
                      {roles.map((role) => (
                        <RoleBadge key={role} role={role} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-muted">
                  @{username}
                  {pronouns && <span className="ms-2 small">({pronouns})</span>}
                </div>
                {socialLinks && (
                  <div className="mt-2">
                    <SocialLinks socialLinks={socialLinks} />
                  </div>
                )}
              </div>
              <div className="d-flex gap-2">
                {isOwner ? (
                  <>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => router.push("/profile")}
                      style={{ borderColor: accentColor, color: accentColor }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = accentColor;
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = accentColor;
                      }}
                    >
                      Edit Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline-primary" size="sm">
                      Add Friend
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled
                      title="DMs are friends-only"
                      style={{ background: accentColor, borderColor: accentColor }}
                    >
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>

            {bio ? <p className="mt-3 mb-1">{bio}</p> : null}

            <div className="d-flex gap-3 text-muted mt-2 small flex-wrap">
              <div>
                <strong>0</strong> posts
              </div>
              <div>
                <strong>0</strong> followers
              </div>
              <div>
                <strong>0</strong> following
              </div>
              {location && <div>📍 {location}</div>}
              {timezone && <div>🕐 {timezone}</div>}
              {memberSince && <div>Member since {memberSince}</div>}
              {lastSeenMs && (
                <div>Last seen {new Date(lastSeenMs).toLocaleString()}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

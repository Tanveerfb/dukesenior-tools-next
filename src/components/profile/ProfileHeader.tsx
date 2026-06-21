"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import SocialLinks from "@/components/user/SocialLinks";
import RoleBadge from "@/components/user/RoleBadge";
import UserAvatar from "@/components/user/UserAvatar";
import type { UserDoc } from "@/lib/services/users";
import type { FriendStatus } from "@/types/friends";
import {
  getRelationshipStatus,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  blockUser,
  getMutualFriends,
} from "@/lib/services/friends";

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

function toMillis(v?: any): number | null {
  if (!v) return null;
  if (typeof v === "number") return v;
  if (typeof v.toMillis === "function") return v.toMillis();
  if (typeof v === "string") {
    const p = Date.parse(v);
    if (!Number.isNaN(p)) return p;
  }
  return null;
}

function Btn({
  children,
  onClick,
  disabled,
  variant = "outline",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline" | "danger";
  className?: string;
}) {
  const base =
    "px-3 py-1.5 text-sm rounded-lg font-medium transition-all disabled:opacity-50 border";
  const styles = {
    primary:
      "bg-primary border-primary text-white hover:opacity-90",
    outline:
      "border-border dark:border-border-dark text-foreground dark:text-foreground-dark hover:bg-surface-100 dark:hover:bg-surface-900/50",
    danger:
      "border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(base, styles[variant], className)}
    >
      {children}
    </button>
  );
}

export default function ProfileHeader({
  uid,
  username,
  displayName,
  photoURL,
  bio,
  createdAt,
  bannerURL,
  accentColor = "#ab2fb1",
  pronouns,
  location,
  socialLinks,
  roles = [],
}: Props) {
  const { user } = useAuth();
  const isOwner = !!(user?.uid && uid && user.uid === uid);
  const router = useRouter();

  const [friendStatus, setFriendStatus] = useState<FriendStatus>("none");
  const [mutualFriendsCount, setMutualFriendsCount] = useState(0);
  const [requestId, setRequestId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const memberSince = toMillis(createdAt)
    ? new Date(toMillis(createdAt)!).toLocaleDateString("en-AU", {
        month: "short",
        year: "numeric",
      })
    : null;

  useEffect(() => {
    if (!user || !uid || isOwner) return;
    let cancelled = false;
    setLoading(true);
    getRelationshipStatus(user.uid, uid)
      .then((result) => {
        if (cancelled) return;
        setFriendStatus(result.status);
        setRequestId(result.requestId);
        if (result.status === "friends") {
          return getMutualFriends(user.uid, uid).then((m) => {
            if (!cancelled) setMutualFriendsCount(m.length);
          });
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user, uid, isOwner]);

  const handleSendRequest = async () => {
    if (!user || !uid || !username) return;
    setActionLoading(true);
    try {
      await sendFriendRequest(user.uid, user.username || "", user.displayName || user.username || "", user.photoURL, uid, username);
      setFriendStatus("pending_sent");
    } catch (e) { console.error(e); } finally { setActionLoading(false); }
  };

  const handleAcceptRequest = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try {
      await acceptFriendRequest(requestId);
      setFriendStatus("friends");
      if (user && uid) { const m = await getMutualFriends(user.uid, uid); setMutualFriendsCount(m.length); }
    } catch (e) { console.error(e); } finally { setActionLoading(false); }
  };

  const handleDeclineRequest = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try { await declineFriendRequest(requestId); setFriendStatus("none"); }
    catch (e) { console.error(e); } finally { setActionLoading(false); }
  };

  const handleCancelRequest = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try { await cancelFriendRequest(requestId); setFriendStatus("none"); }
    catch (e) { console.error(e); } finally { setActionLoading(false); }
  };

  const handleRemoveFriend = async () => {
    if (!user || !uid) return;
    setActionLoading(true);
    try { await removeFriend(user.uid, uid); setFriendStatus("none"); setMutualFriendsCount(0); }
    catch (e) { console.error(e); } finally { setActionLoading(false); }
  };

  const handleBlock = async () => {
    if (!user || !uid || !username) return;
    setActionLoading(true);
    try { await blockUser(user.uid, uid, username); setFriendStatus("blocked"); setMutualFriendsCount(0); }
    catch (e) { console.error(e); } finally { setActionLoading(false); }
  };

  const fallbackGradient = `linear-gradient(135deg, #12130f 0%, #ab2fb1 60%, ${accentColor} 100%)`;
  const bannerBackground = bannerURL
    ? `url(${bannerURL}) center/cover, ${fallbackGradient}`
    : fallbackGradient;

  const userProfile: Partial<UserDoc> = { uid, username, displayName, photoURL };

  return (
    <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark overflow-hidden mb-6">
      {/* Banner */}
      <div className="h-36 sm:h-44 w-full" style={{ background: bannerBackground }} />

      {/* Content */}
      <div className="px-4 sm:px-6 pb-5">
        {/* Avatar + actions row */}
        <div className="flex items-end justify-between" style={{ marginTop: -48 }}>
          <div className="border-4 border-card dark:border-card-dark rounded-full">
            <UserAvatar user={userProfile} size="large" />
          </div>

          <div className="flex gap-2 pb-1">
            {isOwner ? (
              <Btn onClick={() => router.push("/profile")}>Edit Profile</Btn>
            ) : loading ? (
              <span className="text-sm text-foreground-muted dark:text-foreground-dark-muted">…</span>
            ) : (
              <>
                {friendStatus === "none" && (
                  <Btn variant="primary" onClick={handleSendRequest} disabled={actionLoading}>Add Friend</Btn>
                )}
                {friendStatus === "pending_sent" && (
                  <Btn onClick={handleCancelRequest} disabled={actionLoading}>Request Sent</Btn>
                )}
                {friendStatus === "pending_received" && (
                  <>
                    <Btn variant="primary" onClick={handleAcceptRequest} disabled={actionLoading}>Accept</Btn>
                    <Btn variant="danger" onClick={handleDeclineRequest} disabled={actionLoading}>Decline</Btn>
                  </>
                )}
                {friendStatus === "friends" && (
                  <>
                    <Btn variant="primary" onClick={() => router.push(`/messages?username=${username}`)}>Message</Btn>
                    <Btn variant="danger" onClick={handleRemoveFriend} disabled={actionLoading}>Unfriend</Btn>
                  </>
                )}
                {friendStatus === "blocked" && (
                  <span className="text-sm text-foreground-muted dark:text-foreground-dark-muted">Profile unavailable</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Name + roles */}
        <div className="mt-3 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1
              className="text-2xl text-foreground dark:text-foreground-dark leading-tight"
              style={{ fontFamily: "var(--font-permanent-marker, 'Permanent Marker', cursive)", fontWeight: 400 }}
            >
              {displayName || username}
            </h1>
            {roles.map((role) => <RoleBadge key={role} role={role} />)}
          </div>
          <p className="text-sm text-foreground-muted dark:text-foreground-dark-muted">
            @{username}
            {pronouns && <span className="ml-2 opacity-70">({pronouns})</span>}
          </p>
        </div>

        {socialLinks && <div className="mb-3"><SocialLinks socialLinks={socialLinks} /></div>}

        {bio && <p className="text-sm text-foreground dark:text-foreground-dark mb-3 max-w-xl">{bio}</p>}

        {!isOwner && friendStatus === "friends" && mutualFriendsCount > 0 && (
          <p className="text-xs text-foreground-muted dark:text-foreground-dark-muted mb-3">
            {mutualFriendsCount} mutual friend{mutualFriendsCount !== 1 ? "s" : ""}
          </p>
        )}

        <hr className="border-border dark:border-border-dark my-3" />

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 text-xs text-foreground-muted dark:text-foreground-dark-muted">
          <span><strong className="text-foreground dark:text-foreground-dark">0</strong> posts</span>
          <span><strong className="text-foreground dark:text-foreground-dark">0</strong> followers</span>
          <span><strong className="text-foreground dark:text-foreground-dark">0</strong> following</span>
          {location && <span>📍 {location}</span>}
          {memberSince && <span>Joined {memberSince}</span>}
        </div>
      </div>
    </div>
  );
}

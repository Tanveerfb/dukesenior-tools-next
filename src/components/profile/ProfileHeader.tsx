"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/user/UserAvatar";
import RoleBadge from "@/components/user/RoleBadge";
import SocialLinks from "@/components/user/SocialLinks";
import { cn } from "@/lib/utils";
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

/* tiny inline spinner */
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin h-4 w-4", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

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
  pronouns,
  location,
  timezone,
  socialLinks,
  roles = [],
}: Props) {
  const { user } = useAuth();
  const isOwner = !!(user?.uid && uid && user.uid === uid);
  const router = useRouter();

  const [friendStatus, setFriendStatus] = useState<FriendStatus>("none");
  const [mutualFriendsCount, setMutualFriendsCount] = useState<number>(0);
  const [requestId, setRequestId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toMillis(v?: unknown) {
    if (!v) return null;
    if (typeof v === "number") return v;
    if (
      v &&
      typeof v === "object" &&
      "toMillis" in v &&
      typeof (v as { toMillis: () => number }).toMillis === "function"
    )
      return (v as { toMillis: () => number }).toMillis();
    if (typeof v === "string") {
      const p = Date.parse(v);
      if (!Number.isNaN(p)) return p;
    }
    return null;
  }

  const ms = toMillis(createdAt as unknown);
  const memberSince = ms ? new Date(ms).toLocaleDateString() : null;
  const lastSeenMs = toMillis(lastSeen as unknown) || null;

  const userProfile: Partial<UserDoc> = {
    uid,
    username,
    displayName,
    photoURL,
  };

  useEffect(() => {
    if (!user || !uid || isOwner) return;

    async function checkRelationship() {
      setLoading(true);
      try {
        const result = await getRelationshipStatus(user.uid, uid!);
        setFriendStatus(result.status);
        setRequestId(result.requestId);

        if (result.status === "friends") {
          const mutuals = await getMutualFriends(user.uid, uid!);
          setMutualFriendsCount(mutuals.length);
        }
      } catch (error) {
        console.error("Error checking relationship:", error);
      } finally {
        setLoading(false);
      }
    }

    checkRelationship();
  }, [user, uid, isOwner]);

  const handleSendRequest = async () => {
    if (!user || !uid || !username) return;
    setActionLoading(true);
    try {
      await sendFriendRequest(
        user.uid,
        user.username || "",
        user.displayName || user.username || "",
        user.photoURL,
        uid,
        username,
      );
      setFriendStatus("pending_sent");
      alert("Friend request sent!");
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to send friend request";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try {
      await acceptFriendRequest(requestId);
      setFriendStatus("friends");
      alert(`You are now friends with @${username}!`);

      if (user && uid) {
        const mutuals = await getMutualFriends(user.uid, uid);
        setMutualFriendsCount(mutuals.length);
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to accept friend request";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try {
      await declineFriendRequest(requestId);
      setFriendStatus("none");
      alert("Friend request declined");
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to decline friend request";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try {
      await cancelFriendRequest(requestId);
      setFriendStatus("none");
      alert("Friend request cancelled");
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to cancel friend request";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!user || !uid) return;
    if (!confirm(`Remove @${username} from friends?`)) return;
    setActionLoading(true);
    try {
      await removeFriend(user.uid, uid);
      setFriendStatus("none");
      setMutualFriendsCount(0);
      alert(`Removed @${username} from friends`);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to remove friend";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!user || !uid || !username) return;
    if (
      !confirm(
        `Block @${username}? This will remove them from your friends and prevent future interactions.`,
      )
    )
      return;
    setActionLoading(true);
    try {
      await blockUser(user.uid, uid, username);
      setFriendStatus("blocked");
      setMutualFriendsCount(0);
      alert(`Blocked @${username}`);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to block user";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const bannerStyle = bannerURL
    ? {
        backgroundImage: `url(${bannerURL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        background: "bg-secondary", // fallback color if no banner
      };

  return (
    <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow mb-4 overflow-hidden">
      {/* Banner */}
      <div className="h-[200px] w-full relative" style={{ ...bannerStyle }} />

      <div className="px-5 pb-5 relative z-10" style={{ marginTop: -48 }}>
        <div className="flex flex-col md:flex-row items-start">
          {/* Avatar overlapping banner */}
          <div className="mr-3 mb-3 md:mb-0" style={{ marginTop: -48 }}>
            <UserAvatar user={userProfile} size="xlarge" showStatus />
          </div>

          <div className="flex-grow w-full">
            <div className="flex items-start justify-between flex-wrap">
              <div className="mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold text-foreground dark:text-foreground-dark mb-0">
                    {displayName || username}
                  </h2>
                  {roles && roles.length > 0 && (
                    <div className="flex gap-1">
                      {roles.map((role) => (
                        <RoleBadge key={role} role={role} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-foreground-muted dark:text-foreground-dark-muted">
                  @{username}
                  {pronouns && (
                    <span className="ml-2 text-sm">({pronouns})</span>
                  )}
                </div>
                {socialLinks && (
                  <div className="mt-1 flex gap-2">
                    <SocialLinks socialLinks={socialLinks} />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 items-center">
                {isOwner ? (
                  <button
                    onClick={() => router.push("/profile")}
                    className="px-3 py-1.5 text-sm rounded-lg border-2 font-medium transition-all duration-200 border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    Edit Profile
                  </button>
                ) : loading ? (
                  <Spinner />
                ) : (
                  <>
                    {friendStatus === "none" && (
                      <button
                        className="px-3 py-1.5 text-sm rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white transition-colors disabled:opacity-50"
                        onClick={handleSendRequest}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Spinner /> : "Add Friend"}
                      </button>
                    )}
                    {friendStatus === "pending_sent" && (
                      <button
                        className="px-3 py-1.5 text-sm rounded-lg border border-border dark:border-border-dark text-foreground-muted dark:text-foreground-dark-muted hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                        onClick={handleCancelRequest}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Spinner /> : "Request Sent"}
                      </button>
                    )}
                    {friendStatus === "pending_received" && (
                      <>
                        <button
                          className="px-3 py-1.5 text-sm rounded-lg bg-success text-white hover:bg-success-600 transition-colors disabled:opacity-50"
                          onClick={handleAcceptRequest}
                          disabled={actionLoading}
                        >
                          {actionLoading ? <Spinner /> : "Accept Friend"}
                        </button>
                        <button
                          className="px-3 py-1.5 text-sm rounded-lg border border-danger text-danger hover:bg-danger hover:text-white transition-colors disabled:opacity-50"
                          onClick={handleDeclineRequest}
                          disabled={actionLoading}
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {friendStatus === "friends" && (
                      <>
                        <button
                          className="px-3 py-1.5 text-sm rounded-lg bg-primary border-primary text-white hover:bg-primary-600 transition-colors"
                          onClick={() =>
                            router.push(`/messages?username=${username}`)
                          }
                        >
                          Message
                        </button>

                        {/* Custom dropdown */}
                        <div className="relative" ref={dropdownRef}>
                          <button
                            className="px-2 py-1.5 text-sm rounded-lg border border-border dark:border-border-dark text-foreground-muted dark:text-foreground-dark-muted hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                            onClick={() => setDropdownOpen((o) => !o)}
                            disabled={actionLoading}
                          >
                            &bull;&bull;&bull;
                          </button>
                          {dropdownOpen && (
                            <div className="absolute right-0 mt-1 w-44 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-lg z-50 py-1">
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-foreground dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => {
                                  setDropdownOpen(false);
                                  handleRemoveFriend();
                                }}
                              >
                                Remove Friend
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger-50 transition-colors"
                                onClick={() => {
                                  setDropdownOpen(false);
                                  handleBlock();
                                }}
                              >
                                Block
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    {friendStatus === "blocked" && (
                      <span className="text-foreground-muted dark:text-foreground-dark-muted text-sm">
                        Profile unavailable
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {bio ? (
              <p className="mt-3 mb-1 text-foreground dark:text-foreground-dark">
                {bio}
              </p>
            ) : null}

            {!isOwner &&
              friendStatus === "friends" &&
              mutualFriendsCount > 0 && (
                <div className="text-foreground-muted dark:text-foreground-dark-muted text-sm mt-2">
                  {mutualFriendsCount} mutual friend
                  {mutualFriendsCount !== 1 ? "s" : ""}
                </div>
              )}

            <div className="flex gap-3 text-foreground-muted dark:text-foreground-dark-muted mt-2 text-sm flex-wrap">
              <div>
                <strong>0</strong> posts
              </div>
              <div>
                <strong>0</strong> followers
              </div>
              <div>
                <strong>0</strong> following
              </div>
              {location && (
                <div>
                  {"\ud83d\udccd"} {location}
                </div>
              )}
              {timezone && (
                <div>
                  {"\ud83d\udd50"} {timezone}
                </div>
              )}
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

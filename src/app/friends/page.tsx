"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/user/UserAvatar";
import type { Friend, FriendRequest, BlockedUser } from "@/types/friends";
import {
  getFriends,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  getBlockedUsers,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  unblockUser,
} from "@/lib/services/friends";

export default function FriendsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadAllData();
  }, [user, router]);

  const loadAllData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [friendsList, incoming, outgoing, blocked] = await Promise.all([
        getFriends(user.uid),
        getIncomingFriendRequests(user.uid),
        getOutgoingFriendRequests(user.uid),
        getBlockedUsers(user.uid),
      ]);

      setFriends(friendsList);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
      setBlockedUsers(blocked);
    } catch (error) {
      console.error("Error loading friends data:", error);
      alert("Failed to load friends data");
    } finally {
      setLoading(false);
    }
  };

  // Filter friends by search term
  const filteredFriends = friends.filter(
    (friend) =>
      friend.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Handlers
  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      alert("Friend request accepted!");
      await loadAllData();
    } catch (error: any) {
      alert(error.message || "Failed to accept friend request");
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
      alert("Friend request declined");
      await loadAllData();
    } catch (error: any) {
      alert(error.message || "Failed to decline friend request");
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      await cancelFriendRequest(requestId);
      alert("Friend request cancelled");
      await loadAllData();
    } catch (error: any) {
      alert(error.message || "Failed to cancel friend request");
    }
  };

  const handleRemove = async (friendUid: string, friendUsername: string) => {
    if (!user) return;
    if (!confirm(`Remove @${friendUsername} from friends?`)) return;
    try {
      await removeFriend(user.uid, friendUid);
      alert(`Removed @${friendUsername} from friends`);
      await loadAllData();
    } catch (error: any) {
      alert(error.message || "Failed to remove friend");
    }
  };

  const handleUnblock = async (blockedUID: string, blockedUsername: string) => {
    if (!user) return;
    if (!confirm(`Unblock @${blockedUsername}?`)) return;
    try {
      await unblockUser(user.uid, blockedUID);
      alert(`Unblocked @${blockedUsername}`);
      await loadAllData();
    } catch (error: any) {
      alert(error.message || "Failed to unblock user");
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <p>Please log in to view friends</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h3 className="text-xl font-semibold mb-4">Friends</h3>

      {loading ? (
        <div className="text-center py-10">
          <svg
            className="animate-spin h-6 w-6 mx-auto text-primary-500"
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
          <p className="mt-2 text-foreground-secondary">Loading friends...</p>
        </div>
      ) : (
        <>
          {/* Tab buttons */}
          <div className="flex border-b border-border dark:border-border-dark mb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === "all"
                  ? "border-primary-500 text-primary-500"
                  : "border-transparent text-foreground-secondary hover:text-foreground hover:border-gray-300",
              )}
            >
              All Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab("incoming")}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5",
                activeTab === "incoming"
                  ? "border-primary-500 text-primary-500"
                  : "border-transparent text-foreground-secondary hover:text-foreground hover:border-gray-300",
              )}
            >
              Incoming
              {incomingRequests.length > 0 && (
                <span className="rounded-full text-xs font-medium px-2 py-0.5 bg-red-500 text-white">
                  {incomingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("outgoing")}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === "outgoing"
                  ? "border-primary-500 text-primary-500"
                  : "border-transparent text-foreground-secondary hover:text-foreground hover:border-gray-300",
              )}
            >
              Outgoing ({outgoingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("blocked")}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === "blocked"
                  ? "border-primary-500 text-primary-500"
                  : "border-transparent text-foreground-secondary hover:text-foreground hover:border-gray-300",
              )}
            >
              Blocked ({blockedUsers.length})
            </button>
          </div>

          {/* All Friends Panel */}
          {activeTab === "all" && (
            <div>
              <input
                type="text"
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3 block w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-foreground px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              />

              {filteredFriends.length === 0 ? (
                <div className="text-center text-foreground-secondary py-10">
                  {searchTerm ? (
                    <p>No friends found matching &ldquo;{searchTerm}&rdquo;</p>
                  ) : (
                    <p>
                      You haven&apos;t added any friends yet. Find people to
                      connect with!
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.uid}
                      className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm"
                    >
                      <div className="p-4">
                        <div
                          className="flex items-center gap-2 mb-3 cursor-pointer"
                          onClick={() =>
                            router.push(`/profile/${friend.username}`)
                          }
                        >
                          <UserAvatar user={friend} size="medium" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">
                              {friend.displayName}
                            </div>
                            <div className="text-foreground-secondary text-sm">
                              @{friend.username}
                            </div>
                          </div>
                        </div>
                        {friend.bio && (
                          <p className="text-sm text-foreground-secondary mb-3">
                            {friend.bio.substring(0, 60)}
                            {friend.bio.length > 60 ? "..." : ""}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              router.push(`/messages/${friend.username}`)
                            }
                            className="flex-1 text-sm px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
                          >
                            Message
                          </button>
                          <button
                            onClick={() =>
                              handleRemove(friend.uid, friend.username)
                            }
                            className="text-sm px-3 py-1.5 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="text-foreground-secondary text-sm mt-2">
                          Friends since{" "}
                          {new Date(friend.since).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Incoming Requests Panel */}
          {activeTab === "incoming" && (
            <div>
              {incomingRequests.length === 0 ? (
                <div className="text-center text-foreground-secondary py-10">
                  <p>No pending friend requests</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {incomingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() =>
                              router.push(`/profile/${request.fromUsername}`)
                            }
                          >
                            <UserAvatar
                              user={{
                                photoURL: request.fromPhotoURL,
                                displayName: request.fromDisplayName,
                              }}
                              size="medium"
                            />
                            <div>
                              <div className="font-semibold">
                                {request.fromDisplayName}
                              </div>
                              <div className="text-foreground-secondary text-sm">
                                @{request.fromUsername}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAccept(request.id)}
                              className="text-sm px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDecline(request.id)}
                              className="text-sm px-3 py-1.5 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                        <div className="text-foreground-secondary text-sm mt-2">
                          Sent {new Date(request.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Outgoing Requests Panel */}
          {activeTab === "outgoing" && (
            <div>
              {outgoingRequests.length === 0 ? (
                <div className="text-center text-foreground-secondary py-10">
                  <p>No outgoing friend requests</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {outgoingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() =>
                              router.push(`/profile/${request.toUsername}`)
                            }
                          >
                            <div>
                              <div className="font-semibold">
                                @{request.toUsername}
                              </div>
                              <div className="text-foreground-secondary text-sm">
                                Request pending
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCancel(request.id)}
                            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-foreground-secondary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="text-foreground-secondary text-sm mt-2">
                          Sent {new Date(request.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Blocked Users Panel */}
          {activeTab === "blocked" && (
            <div>
              {blockedUsers.length === 0 ? (
                <div className="text-center text-foreground-secondary py-10">
                  <p>You haven&apos;t blocked anyone</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {blockedUsers.map((blocked) => (
                    <div
                      key={blocked.blockedUID}
                      className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <div className="font-semibold">
                              @{blocked.blockedUsername}
                            </div>
                            <div className="text-foreground-secondary text-sm">
                              Blocked{" "}
                              {new Date(blocked.blockedAt).toLocaleString()}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleUnblock(
                                blocked.blockedUID,
                                blocked.blockedUsername,
                              )
                            }
                            className="text-sm px-3 py-1.5 rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          >
                            Unblock
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

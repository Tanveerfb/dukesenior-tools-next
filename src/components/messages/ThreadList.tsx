"use client";

import React, { useState, useMemo } from "react";
import UserAvatar from "@/components/user/UserAvatar";
import type { DMThread } from "@/types/messages";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { cn } from "@/lib/utils";

interface Props {
  threads: DMThread[];
  activeThreadId?: string;
  currentUserId: string;
  onSelectThread: (threadId: string) => void;
  loading?: boolean;
}

/**
 * Format timestamp as relative time
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  if (days === 1) {
    return "Yesterday";
  }
  if (days < 7) {
    return `${days}d ago`;
  }

  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ThreadList({
  threads,
  activeThreadId,
  currentUserId,
  onSelectThread,
  loading = false,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter threads by username
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) {
      return threads;
    }

    const query = searchQuery.toLowerCase();
    return threads.filter((thread) => {
      const otherUserId = thread.participants.find(
        (uid) => uid !== currentUserId,
      );
      if (!otherUserId) return false;

      const otherUser = thread.participantDetails?.[otherUserId];
      if (!otherUser) return false;

      return (
        otherUser.username.toLowerCase().includes(query) ||
        otherUser.displayName.toLowerCase().includes(query)
      );
    });
  }, [threads, searchQuery, currentUserId]);

  if (loading) {
    return (
      <div className="p-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="mb-3">
            <div className="flex items-center">
              <Skeleton circle width={48} height={48} />
              <div className="ml-3 flex-1">
                <Skeleton width={120} height={16} />
                <Skeleton width={180} height={14} className="mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search bar */}
      <div className="border-b border-border p-3 dark:border-border-dark">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "w-full rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground",
            "placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary-500",
            "dark:border-border-dark dark:bg-card-dark",
          )}
        />
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-auto">
        {filteredThreads.length === 0 ? (
          <div className="p-4 text-center text-foreground-secondary">
            {searchQuery ? "No conversations found" : "No messages yet"}
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const otherUserId = thread.participants.find(
              (uid) => uid !== currentUserId,
            );
            if (!otherUserId) return null;

            const otherUser = thread.participantDetails?.[otherUserId];
            if (!otherUser) return null;

            const unreadCount = thread.unreadCount?.[currentUserId] || 0;
            const isActive = thread.id === activeThreadId;

            return (
              <div
                key={thread.id}
                className={cn(
                  "cursor-pointer border-b border-border p-3 transition-colors dark:border-border-dark",
                  isActive
                    ? "bg-gray-100 dark:bg-gray-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                )}
                onClick={() => onSelectThread(thread.id)}
              >
                <div className="flex items-center">
                  {/* Avatar with accent color border */}
                  <div
                    className="shrink-0 rounded-full p-0.5"
                    style={{
                      border: otherUser.accentColor
                        ? `2px solid ${otherUser.accentColor}`
                        : "2px solid #ccc",
                    }}
                  >
                    <UserAvatar
                      user={{
                        ...otherUser,
                        uid: otherUserId,
                      }}
                      size="medium"
                    />
                  </div>

                  {/* Thread info */}
                  <div className="ml-3 min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bold text-foreground">
                          {otherUser.displayName}
                        </div>
                        <div className="truncate text-sm text-foreground-secondary">
                          @{otherUser.username}
                        </div>
                      </div>

                      {/* Timestamp and unread badge */}
                      <div className="ml-2 shrink-0 text-right">
                        {thread.lastMessageAt && (
                          <div className="text-sm text-foreground-secondary">
                            {formatRelativeTime(thread.lastMessageAt)}
                          </div>
                        )}
                        {unreadCount > 0 && (
                          <span className="mt-1 inline-block rounded-full bg-red-500 px-1.5 py-0.5 text-[0.7rem] text-white">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Last message preview */}
                    {thread.lastMessage && (
                      <div className="mt-1 max-w-full truncate text-sm text-foreground-secondary">
                        {thread.lastMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

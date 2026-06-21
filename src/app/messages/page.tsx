"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ThreadList from "@/components/messages/ThreadList";
import ChatWindow from "@/components/messages/ChatWindow";
import type { DMThread } from "@/types/messages";
import {
  listenToThreads,
  createOrGetThread,
  generateThreadId,
} from "@/lib/services/messages";
import { getUserByUsername, getUserByUID } from "@/lib/services/users";
import { blockUser } from "@/lib/services/friends";

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [threads, setThreads] = useState<DMThread[]>([]);
  const [activeThread, setActiveThread] = useState<DMThread | null>(null);
  const [loading, setLoading] = useState(true);

  // Get username from URL params if present (e.g., /messages?username=john)
  const usernameParam = searchParams?.get("username");

  // Listen to threads for current user
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = listenToThreads(user.uid, (updatedThreads) => {
      setThreads(updatedThreads);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Handle username param - create or open thread with that user
  useEffect(() => {
    if (!user?.uid || !usernameParam) return;

    async function openThreadWithUser() {
      try {
        const targetUser = await getUserByUsername(usernameParam!);
        if (!targetUser) {
          alert(`User @${usernameParam} not found`);
          router.push("/messages");
          return;
        }

        const thread = await createOrGetThread(user.uid, targetUser.uid);
        setActiveThread(thread);

        // Clear URL param
        router.replace("/messages", { scroll: false });
      } catch (error: any) {
        console.error("Error opening thread:", error);
        alert(error.message || "Failed to open conversation");
        router.push("/messages");
      }
    }

    openThreadWithUser();
  }, [user?.uid, usernameParam, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/messages");
    }
  }, [user, authLoading, router]);

  const handleSelectThread = async (threadId: string) => {
    const thread = threads.find((t) => t.id === threadId);
    if (thread) {
      setActiveThread(thread);
    }
  };

  const handleBlock = async () => {
    if (!user || !activeThread) return;

    const otherUserId = activeThread.participants.find(
      (uid) => uid !== user.uid,
    );
    if (!otherUserId) return;

    const otherUser = activeThread.participantDetails?.[otherUserId];
    if (!otherUser) return;

    if (
      !confirm(
        `Block @${otherUser.username}? This will remove them from your friends and prevent future interactions.`,
      )
    ) {
      return;
    }

    try {
      await blockUser(user.uid, otherUserId, otherUser.username);
      alert(`Blocked @${otherUser.username}`);
      setActiveThread(null);
      router.push("/messages");
    } catch (error: any) {
      console.error("Error blocking user:", error);
      alert(error.message || "Failed to block user");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center">
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
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  // Get other user details for active thread
  const otherUserId = activeThread?.participants.find(
    (uid) => uid !== user.uid,
  );
  const otherUser = otherUserId
    ? activeThread?.participantDetails?.[otherUserId]
    : null;

  return (
    <div className="w-full px-3 py-3" style={{ height: "calc(100vh - 100px)" }}>
      <div className="grid grid-cols-12 h-full gap-0">
        {/* Thread List - Mobile: Full width when no active thread, Desktop: Fixed width */}
        <div
          className={`col-span-12 md:col-span-4 lg:col-span-3 h-full border-r border-border dark:border-border-dark ${
            activeThread ? "hidden md:block" : ""
          }`}
          style={{ maxWidth: "300px" }}
        >
          <div className="h-full bg-card dark:bg-card-dark rounded-lg shadow-sm">
            <ThreadList
              threads={threads}
              activeThreadId={activeThread?.id}
              currentUserId={user.uid}
              onSelectThread={handleSelectThread}
              loading={loading}
            />
          </div>
        </div>

        {/* Chat Window */}
        <div
          className={`col-span-12 md:col-span-8 lg:col-span-9 h-full ${
            !activeThread ? "hidden md:block" : ""
          }`}
        >
          <div className="h-full bg-card dark:bg-card-dark rounded-lg shadow-sm">
            {activeThread && otherUser ? (
              <ChatWindow
                thread={activeThread}
                currentUser={user}
                otherUser={{
                  ...otherUser,
                  uid: otherUserId,
                }}
                onBlock={handleBlock}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-foreground-secondary">
                {threads.length === 0 ? (
                  <div className="text-center">
                    <h4 className="text-lg font-semibold mb-1">
                      No messages yet
                    </h4>
                    <p>Add friends to start chatting!</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <h4 className="text-lg font-semibold mb-1">
                      Select a conversation
                    </h4>
                    <p>Choose a friend from the list to start messaging</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Back button when thread is active */}
      {activeThread && (
        <div className="md:hidden fixed bottom-0 left-0 p-3">
          <button
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-foreground px-4 py-2 text-sm font-medium transition-colors"
            onClick={() => setActiveThread(null)}
          >
            ← Back to conversations
          </button>
        </div>
      )}
    </div>
  );
}

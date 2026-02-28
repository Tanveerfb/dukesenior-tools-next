"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiSend, FiMoreHorizontal } from "react-icons/fi";
import UserAvatar from "@/components/user/UserAvatar";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import type { DMThread, DMMessage } from "@/types/messages";
import type { UserDoc } from "@/lib/services/users";
import {
  listenToThread,
  sendMessage,
  markThreadAsRead,
  setTyping,
  listenToTyping,
} from "@/lib/services/messages";
import { areFriends, isBlocked } from "@/lib/services/friends";
import { cn } from "@/lib/utils";

interface Props {
  thread: DMThread;
  currentUser: UserDoc;
  otherUser: Partial<UserDoc>;
  onBlock?: () => void;
  onArchive?: () => void;
}

export default function ChatWindow({
  thread,
  currentUser,
  otherUser,
  onBlock,
  onArchive,
}: Props) {
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [canMessage, setCanMessage] = useState(true);
  const [blockStatus, setBlockStatus] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollHeight = useRef<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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

  // Check if users are still friends and not blocked
  useEffect(() => {
    if (!currentUser.uid || !otherUser.uid) return;

    async function checkStatus() {
      try {
        const [friends, blocked1, blocked2] = await Promise.all([
          areFriends(currentUser.uid, otherUser.uid!),
          isBlocked(currentUser.uid, otherUser.uid!),
          isBlocked(otherUser.uid!, currentUser.uid),
        ]);

        if (!friends) {
          setCanMessage(false);
          setBlockStatus("You are no longer friends with this user");
        } else if (blocked1) {
          setCanMessage(false);
          setBlockStatus("You have blocked this user");
        } else if (blocked2) {
          setCanMessage(false);
          setBlockStatus("This user has blocked you");
        } else {
          setCanMessage(true);
          setBlockStatus(null);
        }
      } catch (error) {
        console.error("Error checking friendship status:", error);
      }
    }

    checkStatus();
  }, [currentUser.uid, otherUser.uid, thread.id]);

  // Listen to messages
  useEffect(() => {
    if (!thread.id) return;

    setLoading(true);
    const unsubscribe = listenToThread(thread.id, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [thread.id]);

  // Listen to typing indicators
  useEffect(() => {
    if (!thread.id || !currentUser.uid) return;

    const unsubscribe = listenToTyping(
      thread.id,
      currentUser.uid,
      (indicators) => {
        const typingUserIds = indicators.map((i) => i.uid);
        setTypingUsers(typingUserIds);
      },
    );

    return () => unsubscribe();
  }, [thread.id, currentUser.uid]);

  // Mark messages as read when thread is opened
  useEffect(() => {
    if (!thread.id || !currentUser.uid) return;

    markThreadAsRead(thread.id, currentUser.uid).catch((error) => {
      console.error("Error marking thread as read:", error);
    });
  }, [thread.id, currentUser.uid]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Check if user was near bottom before new messages arrived
    const wasNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    if (wasNearBottom || messages.length <= 1) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!thread.id || !currentUser.uid) return;

    // Send typing indicator
    setTyping(thread.id, currentUser.uid, true).catch((error) => {
      console.error("Error setting typing:", error);
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to clear typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(thread.id, currentUser.uid, false).catch((error) => {
        console.error("Error clearing typing:", error);
      });
    }, 3000);
  }, [thread.id, currentUser.uid]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || sending || !canMessage) return;

    const content = messageInput.trim();
    setMessageInput("");
    setSending(true);

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (thread.id && currentUser.uid) {
      await setTyping(thread.id, currentUser.uid, false).catch(() => {});
    }

    try {
      await sendMessage(thread.id, currentUser.uid, otherUser.uid!, content);
    } catch (error: any) {
      console.error("Error sending message:", error);
      alert(error.message || "Failed to send message");
      setMessageInput(content); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 2000) {
      setMessageInput(value);
      handleTyping();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    },
    {} as Record<string, DMMessage[]>,
  );

  const formatDateSeparator = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (dateString === today) return "Today";
    if (dateString === yesterday) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-3 dark:border-border-dark">
        <div className="flex items-center">
          <UserAvatar user={otherUser} size="medium" showStatus />
          <div className="ml-3">
            <div className="font-bold text-foreground">
              {otherUser.displayName}
            </div>
            <div className="text-sm text-foreground-secondary">
              @{otherUser.username}
            </div>
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className={cn(
              "rounded-md border border-border px-2 py-1 text-sm text-foreground-secondary",
              "hover:bg-gray-100 dark:border-border-dark dark:hover:bg-gray-800",
            )}
          >
            <FiMoreHorizontal />
          </button>
          {dropdownOpen && (
            <div
              className={cn(
                "absolute right-0 z-50 mt-1 min-w-[140px] rounded-md border border-border bg-card py-1 shadow-lg",
                "dark:border-border-dark dark:bg-card-dark",
              )}
            >
              {onArchive && (
                <button
                  type="button"
                  onClick={() => {
                    onArchive();
                    setDropdownOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Archive
                </button>
              )}
              {onBlock && (
                <button
                  type="button"
                  onClick={() => {
                    onBlock();
                    setDropdownOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Block User
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status warning */}
      {blockStatus && (
        <div className="mx-3 mt-3 rounded-md border border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-200">
          {blockStatus}
        </div>
      )}

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-auto bg-[#fafafa] p-3 dark:bg-gray-900/50"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg
              className="h-8 w-8 animate-spin text-foreground-secondary"
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
          </div>
        ) : messages.length === 0 ? (
          <div className="py-20 text-center text-foreground-secondary">
            No messages yet. Say hi! 👋
          </div>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([dateString, msgs]) => (
              <div key={dateString}>
                {/* Date separator */}
                <div className="my-3 text-center">
                  <span className="rounded-full bg-gray-500 px-3 py-1 text-xs font-normal text-white dark:bg-gray-600">
                    {formatDateSeparator(dateString)}
                  </span>
                </div>

                {/* Messages */}
                {msgs.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.from === currentUser.uid}
                    sender={
                      message.from === currentUser.uid ? currentUser : otherUser
                    }
                    showAvatar
                  />
                ))}
              </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <TypingIndicator
                displayName={
                  otherUser.displayName || otherUser.username || "User"
                }
              />
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <div className="border-t border-border p-3 dark:border-border-dark">
        <form onSubmit={handleSendMessage}>
          <div className="flex gap-2">
            <textarea
              rows={1}
              placeholder={
                canMessage
                  ? "Type a message... (Shift+Enter for new line)"
                  : "Cannot send messages"
              }
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={sending || !canMessage}
              className={cn(
                "flex-1 resize-none overflow-y-auto rounded-md border border-border bg-card px-3 py-2 text-foreground",
                "placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary-500",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "dark:border-border-dark dark:bg-card-dark",
              )}
              style={{ maxHeight: 120 }}
            />
            <button
              type="submit"
              disabled={!messageInput.trim() || sending || !canMessage}
              className={cn(
                "flex items-center justify-center rounded-md px-4 py-2 text-white",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
              style={{
                background: currentUser.accentColor || "#5865F2",
                borderColor: currentUser.accentColor || "#5865F2",
              }}
            >
              {sending ? (
                <svg
                  className="h-4 w-4 animate-spin text-white"
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
              ) : (
                <FiSend />
              )}
            </button>
          </div>
          <div className="mt-1 text-right">
            <span className="text-xs text-foreground-secondary">
              {messageInput.length} / 2000
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

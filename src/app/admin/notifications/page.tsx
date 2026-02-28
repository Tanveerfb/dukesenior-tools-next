"use client";

import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/types/notification";

export default function AdminNotificationsPage() {
  const { user, admin } = useAuth();
  const { createNotification } = useNotifications();
  const { showToast } = useToast();

  const [userId, setUserId] = useState("");
  const [type, setType] = useState<NotificationType>("general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [sending, setSending] = useState(false);

  if (!admin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded text-red-700 dark:text-red-400">
          You must be an admin to access this page.
        </div>
      </div>
    );
  }

  const handleSendNotification = async () => {
    if (!userId || !title || !body) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSending(true);
    try {
      await createNotification({
        userId,
        type,
        title,
        body,
        ...(link.trim() && { link: link.trim() }),
      });
      showToast("Notification sent successfully", "success");

      // Clear form
      setUserId("");
      setTitle("");
      setBody("");
      setLink("");
    } catch (error) {
      console.error("Error sending notification:", error);
      showToast("Failed to send notification", "error");
    } finally {
      setSending(false);
    }
  };

  const handleSendToSelf = () => {
    if (user?.uid) {
      setUserId(user.uid);
    }
  };

  const notificationTypes: NotificationType[] = [
    "message",
    "friend-request",
    "mention",
    "system",
    "tournament",
    "general",
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">
        Send Notification
      </h1>
      <p className="text-sm text-foreground-secondary mb-6">
        Use this page to send test notifications to users
      </p>

      <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-xl p-6 shadow">
        <div className="flex flex-col gap-5">
          {/* User ID + Use My ID */}
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">
                User ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className={cn(
                  "w-full rounded-lg border border-border dark:border-border-dark",
                  "bg-card dark:bg-card-dark text-foreground",
                  "px-3 py-2 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500",
                )}
                placeholder="Enter the Firebase UID of the recipient"
              />
              <p className="text-xs text-foreground-secondary mt-1">
                Enter the Firebase UID of the recipient
              </p>
            </div>
            <button
              type="button"
              onClick={handleSendToSelf}
              className={cn(
                "mt-6 min-w-[120px] rounded-lg border border-border dark:border-border-dark",
                "px-4 py-2 text-sm font-medium",
                "text-foreground bg-card dark:bg-card-dark",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                "transition-colors",
              )}
            >
              Use My ID
            </button>
          </div>

          {/* Type Select */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as NotificationType)}
              required
              className={cn(
                "w-full rounded-lg border border-border dark:border-border-dark",
                "bg-card dark:bg-card-dark text-foreground",
                "px-3 py-2 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary-500",
              )}
            >
              {notificationTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={cn(
                "w-full rounded-lg border border-border dark:border-border-dark",
                "bg-card dark:bg-card-dark text-foreground",
                "px-3 py-2 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary-500",
              )}
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Body <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={4}
              className={cn(
                "w-full rounded-lg border border-border dark:border-border-dark",
                "bg-card dark:bg-card-dark text-foreground",
                "px-3 py-2 text-sm resize-vertical",
                "focus:outline-none focus:ring-2 focus:ring-primary-500",
              )}
            />
          </div>

          {/* Link (Optional) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Link (Optional)
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className={cn(
                "w-full rounded-lg border border-border dark:border-border-dark",
                "bg-card dark:bg-card-dark text-foreground",
                "px-3 py-2 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary-500",
              )}
            />
            <p className="text-xs text-foreground-secondary mt-1">
              Optional link to navigate to when clicking the notification
            </p>
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSendNotification}
            disabled={sending || !userId || !title || !body}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-lg",
              "bg-primary-500 text-white px-4 py-2.5 text-sm font-medium",
              "hover:bg-primary-600 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {sending ? (
              <svg
                className="animate-spin h-5 w-5"
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
              <FiSend className="h-4 w-4" />
            )}
            {sending ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Quick Actions
        </h2>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              setType("system");
              setTitle("System Notification");
              setBody("This is a test system notification");
            }}
            className={cn(
              "w-full rounded-lg border border-border dark:border-border-dark",
              "px-4 py-2.5 text-sm font-medium",
              "text-foreground bg-card dark:bg-card-dark",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "transition-colors",
            )}
          >
            Fill System Template
          </button>
          <button
            type="button"
            onClick={() => {
              setType("tournament");
              setTitle("Tournament Update");
              setBody("A new tournament has started!");
              setLink("/phasmotourney-series");
            }}
            className={cn(
              "w-full rounded-lg border border-border dark:border-border-dark",
              "px-4 py-2.5 text-sm font-medium",
              "text-foreground bg-card dark:bg-card-dark",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "transition-colors",
            )}
          >
            Fill Tournament Template
          </button>
          <button
            type="button"
            onClick={() => {
              setType("message");
              setTitle("New Message");
              setBody("You have a new message from a friend");
              setLink("/messages");
            }}
            className={cn(
              "w-full rounded-lg border border-border dark:border-border-dark",
              "px-4 py-2.5 text-sm font-medium",
              "text-foreground bg-card dark:bg-card-dark",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "transition-colors",
            )}
          >
            Fill Message Template
          </button>
        </div>
      </div>
    </div>
  );
}

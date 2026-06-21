"use client";

import { useState } from "react";
import { FiBell, FiCheck, FiCheckCircle, FiTrash2 } from "react-icons/fi";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotificationHandler,
  } = useNotifications();

  const [deleting, setDeleting] = useState<string | null>(null);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="rounded-lg border border-blue-300 bg-blue-50 p-4 text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200">
          Please log in to view your notifications.
        </div>
      </div>
    );
  }

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingRead(notificationId);
    try {
      await markAsRead(notificationId);
      showToast("Notification marked as read", "success");
    } catch (error) {
      showToast("Failed to mark notification as read", "error");
    } finally {
      setMarkingRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllRead(true);
    try {
      await markAllAsRead();
      showToast("All notifications marked as read", "success");
    } catch (error) {
      showToast("Failed to mark all notifications as read", "error");
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    setDeleting(notificationId);
    try {
      await deleteNotificationHandler(notificationId);
      showToast("Notification deleted", "success");
    } catch (error) {
      showToast("Failed to delete notification", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (notification.link) {
      router.push(notification.link);
    }
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const getChipClasses = (type: string) => {
    switch (type) {
      case "message":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "friend-request":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "mention":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "tournament":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200";
      case "system":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium",
                "text-foreground hover:bg-gray-100 dark:border-border-dark dark:hover:bg-gray-800",
                "disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
              )}
            >
              <FiCheckCircle className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>
        {unreadCount > 0 && (
          <p className="text-sm text-foreground-secondary">
            You have {unreadCount} unread notification
            {unreadCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary-500" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow dark:border-border-dark dark:bg-card-dark">
          <FiBell className="mx-auto mb-4 h-16 w-16 text-foreground-secondary" />
          <h2 className="mb-1 text-lg text-foreground-secondary">
            No notifications yet
          </h2>
          <p className="text-sm text-foreground-secondary">
            You&apos;ll see notifications here when you receive messages or
            updates
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow dark:border-border-dark dark:bg-card-dark">
          {notifications.map((notification, index) => (
            <div key={notification.id}>
              <div
                className={cn(
                  "flex items-start justify-between gap-4 px-4 py-3",
                  notification.link ? "cursor-pointer" : "cursor-default",
                  notification.read
                    ? "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800/70",
                )}
                onClick={() =>
                  notification.link && handleNotificationClick(notification)
                }
              >
                {/* Text content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "text-base text-foreground",
                        notification.read ? "font-normal" : "font-bold",
                      )}
                    >
                      {notification.title}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-medium leading-none",
                        getChipClasses(notification.type),
                      )}
                    >
                      {notification.type}
                    </span>
                  </div>
                  <span className="block text-sm text-foreground-secondary">
                    {notification.body}
                  </span>
                  <span className="mt-1 block text-xs text-foreground-secondary">
                    {formatTimestamp(notification.createdAt)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                  {!notification.read && (
                    <button
                      aria-label="mark as read"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      disabled={markingRead === notification.id}
                      className={cn(
                        "rounded-full p-1.5 text-foreground-secondary transition-colors",
                        "hover:bg-gray-200 dark:hover:bg-gray-700",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                      )}
                    >
                      <FiCheck className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                    disabled={deleting === notification.id}
                    className={cn(
                      "rounded-full p-1.5 text-foreground-secondary transition-colors",
                      "hover:bg-gray-200 dark:hover:bg-gray-700",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {index < notifications.length - 1 && (
                <hr className="border-border dark:border-border-dark" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

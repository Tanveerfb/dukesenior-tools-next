"use client";

import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Check as CheckIcon,
  DoneAll as DoneAllIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">Please log in to view your notifications.</Alert>
      </Container>
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

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "message":
        return "primary";
      case "friend-request":
        return "secondary";
      case "mention":
        return "warning";
      case "tournament":
        return "info";
      case "system":
        return "error";
      default:
        return "default";
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        {unreadCount > 0 && (
          <Typography variant="body2" color="text.secondary">
            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </Typography>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "background.paper",
          }}
        >
          <NotificationsIcon
            sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No notifications yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You'll see notifications here when you receive messages or updates
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ bgcolor: "background.paper" }}>
          <List sx={{ py: 0 }}>
            {notifications.map((notification, index) => (
              <Box key={notification.id}>
                <ListItem
                  sx={{
                    py: 2,
                    px: 2,
                    cursor: notification.link ? "pointer" : "default",
                    bgcolor: notification.read
                      ? "transparent"
                      : "action.hover",
                    "&:hover": {
                      bgcolor: notification.read
                        ? "action.hover"
                        : "action.selected",
                    },
                  }}
                  onClick={() =>
                    notification.link && handleNotificationClick(notification)
                  }
                  secondaryAction={
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      {!notification.read && (
                        <IconButton
                          edge="end"
                          aria-label="mark as read"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          disabled={markingRead === notification.id}
                          size="small"
                        >
                          <CheckIcon />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        disabled={deleting === notification.id}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight={notification.read ? "normal" : "bold"}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.type}
                          size="small"
                          color={getNotificationTypeColor(notification.type)}
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.body}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          {formatTimestamp(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}

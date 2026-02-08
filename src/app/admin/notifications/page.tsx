"use client";

import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/components/ui/ToastProvider";
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          You must be an admin to access this page.
        </Alert>
      </Container>
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        Send Notification
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Use this page to send test notifications to users
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              label="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              fullWidth
              required
              helperText="Enter the Firebase UID of the recipient"
            />
            <Button
              variant="outlined"
              onClick={handleSendToSelf}
              sx={{ minWidth: 120 }}
            >
              Use My ID
            </Button>
          </Box>

          <TextField
            select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as NotificationType)}
            fullWidth
            required
          >
            {notificationTypes.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            fullWidth
            required
            multiline
            rows={4}
          />

          <TextField
            label="Link (Optional)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            fullWidth
            helperText="Optional link to navigate to when clicking the notification"
          />

          <Button
            variant="contained"
            startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
            onClick={handleSendNotification}
            disabled={sending || !userId || !title || !body}
            fullWidth
          >
            {sending ? "Sending..." : "Send Notification"}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setType("system");
              setTitle("System Notification");
              setBody("This is a test system notification");
            }}
          >
            Fill System Template
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setType("tournament");
              setTitle("Tournament Update");
              setBody("A new tournament has started!");
              setLink("/phasmotourney-series");
            }}
          >
            Fill Tournament Template
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setType("message");
              setTitle("New Message");
              setBody("You have a new message from a friend");
              setLink("/messages");
            }}
          >
            Fill Message Template
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

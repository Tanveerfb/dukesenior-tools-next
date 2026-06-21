"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Avatar,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import SocialLinks from "@/components/user/SocialLinks";
import RoleBadge from "@/components/user/RoleBadge";
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

export default function ProfileHeader({
  uid,
  username,
  displayName,
  photoURL,
  bio,
  createdAt,
  lastSeen,
  bannerURL,
  accentColor = "#ab2fb1",
  pronouns,
  location,
  timezone: _timezone,
  socialLinks,
  roles = [],
}: Props) {
  const theme = useTheme();
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
    return () => {
      cancelled = true;
    };
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
    } catch (e: any) {
      console.error(e);
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
      if (user && uid) {
        const m = await getMutualFriends(user.uid, uid);
        setMutualFriendsCount(m.length);
      }
    } catch (e: any) {
      console.error(e);
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
    } catch (e: any) {
      console.error(e);
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
    } catch (e: any) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!user || !uid) return;
    setActionLoading(true);
    try {
      await removeFriend(user.uid, uid);
      setFriendStatus("none");
      setMutualFriendsCount(0);
    } catch (e: any) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!user || !uid || !username) return;
    setActionLoading(true);
    try {
      await blockUser(user.uid, uid, username);
      setFriendStatus("blocked");
      setMutualFriendsCount(0);
    } catch (e: any) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const fallbackGradient = `linear-gradient(135deg, #12130f 0%, #ab2fb1 60%, ${accentColor} 100%)`;
  const bannerBackground = bannerURL
    ? `url(${bannerURL}) center/cover, ${fallbackGradient}`
    : fallbackGradient;

  const initials = (displayName || username || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
        border: `1px solid ${theme.palette.divider}`,
        mb: 3,
      }}
    >
      {/* Banner */}
      <Box
        sx={{
          height: { xs: 140, sm: 180 },
          background: bannerBackground,
          position: "relative",
        }}
      />

      {/* Content area */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>
        {/* Avatar + action row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            mt: "-52px",
            mb: 2,
          }}
        >
          <Avatar
            src={photoURL || undefined}
            alt={displayName || username}
            sx={{
              width: 96,
              height: 96,
              border: `4px solid ${theme.palette.background.paper}`,
              fontSize: "2rem",
              bgcolor: accentColor,
              fontFamily:
                "var(--font-permanent-marker, 'Permanent Marker', cursive)",
            }}
          >
            {initials}
          </Avatar>

          {/* Action buttons */}
          <Box sx={{ display: "flex", gap: 1, pb: 0.5 }}>
            {isOwner ? (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => router.push("/profile")}
                sx={{ borderColor: "divider", color: "text.primary" }}
              >
                Edit Profile
              </Button>
            ) : loading ? (
              <CircularProgress size={20} />
            ) : (
              <>
                {friendStatus === "none" && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSendRequest}
                    disabled={actionLoading}
                    sx={{ bgcolor: "primary.main" }}
                  >
                    Add Friend
                  </Button>
                )}
                {friendStatus === "pending_sent" && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCancelRequest}
                    disabled={actionLoading}
                  >
                    Request Sent
                  </Button>
                )}
                {friendStatus === "pending_received" && (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      onClick={handleAcceptRequest}
                      disabled={actionLoading}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={handleDeclineRequest}
                      disabled={actionLoading}
                    >
                      Decline
                    </Button>
                  </>
                )}
                {friendStatus === "friends" && (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() =>
                        router.push(`/messages?username=${username}`)
                      }
                      sx={{ bgcolor: "primary.main" }}
                    >
                      Message
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={handleRemoveFriend}
                      disabled={actionLoading}
                    >
                      Unfriend
                    </Button>
                  </>
                )}
                {friendStatus === "blocked" && (
                  <Typography variant="caption" color="text.disabled">
                    Profile unavailable
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Box>

        {/* Name + roles */}
        <Box sx={{ mb: 0.5 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontFamily:
                  "var(--font-permanent-marker, 'Permanent Marker', cursive)",
                fontWeight: 400,
                lineHeight: 1.2,
              }}
            >
              {displayName || username}
            </Typography>
            {roles.map((role) => (
              <RoleBadge key={role} role={role} />
            ))}
          </Stack>

          <Typography variant="body2" color="text.secondary">
            @{username}
            {pronouns && (
              <Box component="span" sx={{ ml: 1, opacity: 0.7 }}>
                ({pronouns})
              </Box>
            )}
          </Typography>
        </Box>

        {/* Social links */}
        {socialLinks && (
          <Box sx={{ mb: 1.5 }}>
            <SocialLinks socialLinks={socialLinks} />
          </Box>
        )}

        {/* Bio */}
        {bio && (
          <Typography variant="body2" sx={{ mb: 1.5, maxWidth: 560 }}>
            {bio}
          </Typography>
        )}

        {/* Mutual friends */}
        {!isOwner && friendStatus === "friends" && mutualFriendsCount > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
            {mutualFriendsCount} mutual friend{mutualFriendsCount !== 1 ? "s" : ""}
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Meta stats row */}
        <Stack
          direction="row"
          spacing={2}
          flexWrap="wrap"
          alignItems="center"
          sx={{ color: "text.secondary" }}
        >
          <Typography variant="caption">
            <Box component="strong" sx={{ color: "text.primary", fontWeight: 600 }}>
              0
            </Box>{" "}
            posts
          </Typography>
          <Typography variant="caption">
            <Box component="strong" sx={{ color: "text.primary", fontWeight: 600 }}>
              0
            </Box>{" "}
            followers
          </Typography>
          <Typography variant="caption">
            <Box component="strong" sx={{ color: "text.primary", fontWeight: 600 }}>
              0
            </Box>{" "}
            following
          </Typography>
          {location && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <PlaceIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption">{location}</Typography>
            </Stack>
          )}
          {memberSince && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <CalendarTodayIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption">Joined {memberSince}</Typography>
            </Stack>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

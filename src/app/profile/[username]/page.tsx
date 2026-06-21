import React from "react";
import { notFound } from "next/navigation";
import { Box, Container, Grid, Paper, Typography, Stack, Divider } from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AboutEditor from "@/components/profile/AboutEditor";
import UIDCopyCard from "@/components/profile/UIDCopyCard";
import { getUserByUsername, getUserByUID } from "@/lib/services/users";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = (await params) as { username: string };
  let user = await getUserByUsername(username);
  if (!user) user = await getUserByUID(username);
  if (!user) return notFound();

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-AU", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <ProfileHeader
        uid={user.uid}
        username={user.username}
        displayName={user.displayName}
        photoURL={user.photoURL}
        bio={typeof user.bio === "string" ? user.bio : ""}
        createdAt={user.createdAt}
        lastSeen={user.lastSeen}
        signInCount={user.signInCount}
        bannerURL={user.bannerURL}
        accentColor={user.accentColor}
        pronouns={user.pronouns}
        location={user.location}
        timezone={user.timezone}
        socialLinks={user.socialLinks}
        roles={user.roles}
      />

      <Grid container spacing={3}>
        {/* Left column */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Recent Activity */}
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontFamily:
                    "var(--font-permanent-marker, 'Permanent Marker', cursive)",
                  fontWeight: 400,
                  mb: 2,
                }}
              >
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No public activity to show yet.
              </Typography>
            </Paper>

            {/* Posts */}
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontFamily:
                    "var(--font-permanent-marker, 'Permanent Marker', cursive)",
                  fontWeight: 400,
                  mb: 2,
                }}
              >
                Posts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.displayName || user.username} hasn't posted yet.
              </Typography>
            </Paper>
          </Stack>
        </Grid>

        {/* Right column */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* About */}
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontFamily:
                    "var(--font-permanent-marker, 'Permanent Marker', cursive)",
                  fontWeight: 400,
                  mb: 2,
                }}
              >
                About
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {user.bio || "No bio provided."}
              </Typography>

              {(user.location || memberSince) && (
                <>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    {user.location && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PlaceIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                        <Typography variant="caption" color="text.secondary">
                          {user.location}
                        </Typography>
                      </Stack>
                    )}
                    {memberSince && (
                      <Typography variant="caption" color="text.secondary">
                        Member since {memberSince}
                      </Typography>
                    )}
                  </Stack>
                </>
              )}

              <Box sx={{ mt: 2 }}>
                <AboutEditor
                  uid={user.uid}
                  bio={typeof user.bio === "string" ? user.bio : ""}
                />
              </Box>
            </Paper>

            {/* Stats */}
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontFamily:
                    "var(--font-permanent-marker, 'Permanent Marker', cursive)",
                  fontWeight: 400,
                  mb: 2,
                }}
              >
                Stats
              </Typography>
              <Stack spacing={1.5}>
                {[
                  { label: "Posts", value: 0 },
                  { label: "Followers", value: 0 },
                  { label: "Following", value: 0 },
                ].map(({ label, value }) => (
                  <Box
                    key={label}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily:
                          "var(--font-permanent-marker, 'Permanent Marker', cursive)",
                        fontWeight: 400,
                        color: "primary.main",
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>

            <UIDCopyCard uid={user.uid} />
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

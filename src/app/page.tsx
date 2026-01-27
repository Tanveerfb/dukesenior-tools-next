"use client";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import HeroSection from "@/components/home/HeroSection";
import StatsOverview from "@/components/home/StatsOverview";
import FeaturedPosts from "@/components/home/FeaturedPosts";
import QuickActions from "@/components/home/QuickActions";
import ActivityFeed from "@/components/home/ActivityFeed";

export default function HomePage() {
  return (
    <Box component="main">
      {/* Hero Section - Full Width */}
      <HeroSection />

      {/* Stats Overview - Full Width */}
      <StatsOverview />

      {/* Main Content - Two Column Layout */}
      <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: "background.default" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Left Column - Featured Posts */}
            <Grid item xs={12} lg={8}>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                    <Box
                      component="span"
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: "secondary.main",
                        color: "secondary.contrastText",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Latest Updates
                    </Box>
                  </Stack>
                  <Typography
                    variant="h4"
                    component="h2"
                    gutterBottom
                    sx={{ fontWeight: 600, fontSize: { xs: "1.75rem", md: "2rem" } }}
                  >
                    Community Posts & Resource Drops
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Stay current on announcements, guides, and match recaps from the DukeSenior team.
                  </Typography>
                </Box>

                <FeaturedPosts maxFeatured={6} showSampleFallback={false} />
              </Stack>
            </Grid>

            {/* Right Column - Quick Actions & Activity Feed */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={4}>
                <QuickActions />
                <ActivityFeed />
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

"use client";
import { Box, Container, Stack, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@mui/material/styles";

const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);
const MotionButton = motion.create(Button);

export default function HeroSection() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${
          theme.palette.mode === "dark"
            ? "rgba(171, 47, 177, 0.15)"
            : "rgba(171, 47, 177, 0.08)"
        } 50%, ${theme.palette.background.default} 100%)`,
      }}
    >
      {/* Animated background shape */}
      <MotionBox
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        sx={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "50%",
          height: "140%",
          background: `radial-gradient(circle, ${theme.palette.primary.main} 0%, transparent 70%)`,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <Container
        maxWidth="lg"
        sx={{ py: { xs: 6, md: 10 }, position: "relative", zIndex: 1 }}
      >
        <Stack spacing={4} alignItems="center" textAlign="center">
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              component="span"
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: 2,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "primary.dark"
                    : "primary.light",
                color: "primary.contrastText",
                fontSize: "0.875rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              The Lair of Evil
            </Box>
          </MotionBox>

          <MotionTypography
            variant="h1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            sx={{
              fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
              fontWeight: 700,
              lineHeight: 1.2,
              maxWidth: "900px",
            }}
          >
            Your Hub for Phasmo Tournaments & Community Tools
          </MotionTypography>

          <MotionTypography
            variant="h5"
            color="text.secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{
              maxWidth: "700px",
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}
          >
            Brackets, recorded runs, stats, leaderboards, and community features
            — all in one place. Join the DukeSenior community today.
          </MotionTypography>

          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              <Link href="/phasmotourney-series" passHref legacyBehavior>
                <MotionButton
                  variant="contained"
                  size="large"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  sx={{ px: 4, py: 1.5, fontSize: "1rem" }}
                >
                  View Tournaments
                </MotionButton>
              </Link>
              <Link href="/suggestions" passHref legacyBehavior>
                <MotionButton
                  variant="outlined"
                  size="large"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  sx={{ px: 4, py: 1.5, fontSize: "1rem" }}
                >
                  Community Hub
                </MotionButton>
              </Link>
            </Stack>
          </MotionBox>
        </Stack>
      </Container>
    </Box>
  );
}

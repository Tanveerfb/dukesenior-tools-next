"use client";
import { useEffect, useState, useRef } from "react";
import { Box, Container, Grid, Paper, Stack, Typography } from "@mui/material";
import { motion, useInView } from "framer-motion";
import { useTheme } from "@mui/material/styles";
import {
  EmojiEvents as TrophyIcon,
  Group as GroupIcon,
  VideoLibrary as VideoIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";

const MotionPaper = motion.create(Paper);

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  delay?: number;
}

function CountUpAnimation({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const startValue = 0;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(startValue + (end - startValue) * easeOut);

      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup function to cancel animation on unmount
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [end, duration, isInView]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function StatCard({ icon, label, value, suffix = "", color, delay = 0 }: StatCardProps) {
  const theme = useTheme();

  return (
    <Grid item xs={12} sm={6} md={3}>
      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -4, boxShadow: theme.shadows[8] }}
        elevation={2}
        sx={{
          p: 3,
          height: "100%",
          background: theme.palette.mode === "dark" 
            ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${color}15 100%)`
            : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${color}10 100%)`,
          border: `1px solid ${theme.palette.divider}`,
          transition: "all 0.3s ease",
        }}
      >
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: `${color}20`,
              color: color,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography
              variant="h3"
              component="div"
              sx={{
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 700,
                color: color,
                lineHeight: 1,
              }}
            >
              <CountUpAnimation end={value} suffix={suffix} />
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
              {label}
            </Typography>
          </Box>
        </Stack>
      </MotionPaper>
    </Grid>
  );
}

export default function StatsOverview() {
  const theme = useTheme();

  // These would typically come from API/Firebase
  const stats = [
    {
      icon: <GroupIcon sx={{ fontSize: 32 }} />,
      label: "Active Players",
      value: 47,
      color: theme.palette.primary.main,
      delay: 0,
    },
    {
      icon: <TrophyIcon sx={{ fontSize: 32 }} />,
      label: "Tournaments",
      value: 5,
      color: theme.palette.warning.main,
      delay: 0.1,
    },
    {
      icon: <VideoIcon sx={{ fontSize: 32 }} />,
      label: "Recorded Runs",
      value: 230,
      suffix: "+",
      color: theme.palette.info.main,
      delay: 0.2,
    },
    {
      icon: <TrendingIcon sx={{ fontSize: 32 }} />,
      label: "Community Posts",
      value: 42,
      color: theme.palette.success.main,
      delay: 0.3,
    },
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

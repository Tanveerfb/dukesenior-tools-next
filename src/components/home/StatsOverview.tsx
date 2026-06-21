"use client";
import { useEffect, useState, useRef } from "react";
import { Box, Container, Divider, Typography } from "@mui/material";
import { motion, useInView } from "framer-motion";

const MotionBox = motion.create(Box);

function CountUpAnimation({
  end,
  duration = 2000,
  suffix = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    let animationFrameId: number;
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * easeOut));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration, isInView]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const stats = [
  { value: 47, label: "Active Players" },
  { value: 5, label: "Tournaments" },
  { value: 230, suffix: "+", label: "Recorded Runs" },
  { value: 42, label: "Community Posts" },
];

export default function StatsOverview() {
  return (
    <Box sx={{ py: { xs: 5, md: 6 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: { xs: 4, sm: 0 },
          }}
        >
          {stats.map((stat, i) => (
            <Box
              key={stat.label}
              sx={{
                display: "flex",
                alignItems: "stretch",
                flex: { xs: "0 0 45%", sm: "1 1 0" },
                justifyContent: "center",
              }}
            >
              <MotionBox
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  px: { xs: 2, md: 4 },
                  py: { xs: 1, md: 2 },
                }}
              >
                <Typography
                  component="div"
                  sx={{
                    fontFamily:
                      "var(--font-permanent-marker, 'Permanent Marker', cursive)",
                    fontWeight: 400,
                    fontSize: { xs: "2.5rem", md: "3.25rem" },
                    color: "primary.main",
                    lineHeight: 1,
                    mb: 0.75,
                  }}
                >
                  <CountUpAnimation
                    end={stat.value}
                    suffix={stat.suffix ?? ""}
                  />
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500, fontSize: "0.875rem" }}
                >
                  {stat.label}
                </Typography>
              </MotionBox>
              {i < stats.length - 1 && (
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ display: { xs: "none", sm: "block" }, my: 1 }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

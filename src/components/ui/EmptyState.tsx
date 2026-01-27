"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Card as MuiCard, CardContent, Typography, Box } from "@mui/material";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const MotionCard = motion(MuiCard);

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <MotionCard
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
      sx={{
        border: 0,
        boxShadow: 0,
        textAlign: "center",
      }}
    >
      <CardContent sx={{ py: 5 }}>
        {icon && (
          <Box
            sx={{
              fontSize: "3rem",
              opacity: 0.5,
              mb: 3,
              "& > *": { fontSize: "inherit" },
            }}
          >
            {icon}
          </Box>
        )}
        <Typography variant="h5" component="h3" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {description}
          </Typography>
        )}
        {action && <Box sx={{ mt: 3 }}>{action}</Box>}
      </CardContent>
    </MotionCard>
  );
}

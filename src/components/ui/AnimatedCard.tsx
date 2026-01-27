"use client";
import { motion } from "framer-motion";
import { Card, CardProps } from "@mui/material";
import { ReactNode } from "react";

interface AnimatedCardProps extends CardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedCard({
  children,
  className = "",
  delay = 0,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{ display: "inline-block", width: "100%" }}
    >
      <Card elevation={2} className={className} {...props}>
        {children}
      </Card>
    </motion.div>
  );
}

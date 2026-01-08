"use client";
import { motion } from "framer-motion";
import { Card } from "react-bootstrap";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  [key: string]: any;
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
    >
      <Card className={`shadow-sm ${className}`} {...props}>
        {children}
      </Card>
    </motion.div>
  );
}

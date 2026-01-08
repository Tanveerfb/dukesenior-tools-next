"use client";
import { motion } from "framer-motion";
import { Button } from "react-bootstrap";
import { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  variant?: string;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}

export default function AnimatedButton({
  children,
  variant = "primary",
  className = "",
  onClick,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        variant={variant}
        className={className}
        onClick={onClick}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}

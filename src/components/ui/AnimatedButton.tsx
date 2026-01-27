"use client";
import { motion } from "framer-motion";
import { Button, ButtonProps } from "@mui/material";
import { ReactNode } from "react";

interface AnimatedButtonProps extends Omit<ButtonProps, 'variant'> {
  children: ReactNode;
  variant?: "text" | "outlined" | "contained";
  className?: string;
  onClick?: () => void;
}

const MotionButton = motion(Button);

export default function AnimatedButton({
  children,
  variant = "contained",
  color = "primary",
  className = "",
  onClick,
  ...props
}: AnimatedButtonProps) {
  return (
    <MotionButton
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      variant={variant}
      color={color}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </MotionButton>
  );
}

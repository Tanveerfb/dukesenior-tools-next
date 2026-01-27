"use client";
import { motion } from "framer-motion";
import { Button, ButtonProps } from "@mui/material";
import { ReactNode } from "react";

interface AnimatedButtonProps extends ButtonProps {
  children: ReactNode;
}

export default function AnimatedButton({
  children,
  variant = "contained",
  color = "primary",
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      style={{ display: "inline-block" }}
    >
      <Button variant={variant} color={color} {...props}>
        {children}
      </Button>
    </motion.div>
  );
}

"use client";
import { Card as MuiCard, CardProps as MuiCardProps, styled } from "@mui/material";
import { forwardRef, ReactNode } from "react";

export interface CardProps extends Omit<MuiCardProps, "variant"> {
  variant?: "default" | "elevated" | "outlined" | "glass";
  children: ReactNode;
}

const StyledCard = styled(MuiCard, {
  shouldForwardProp: (prop) => prop !== "customVariant",
})<{ customVariant?: string }>(({ theme, customVariant }) => {
  const baseStyles = {
    transition: "all 0.3s ease",
  };

  const variantStyles = {
    default: {},
    elevated: {
      boxShadow: theme.shadows[3],
      "&:hover": {
        boxShadow: theme.shadows[8],
        transform: "translateY(-2px)",
      },
    },
    outlined: {
      border: `2px solid ${theme.palette.divider}`,
      boxShadow: "none",
      backgroundColor: "transparent",
    },
    glass: {
      backgroundColor: theme.palette.mode === "dark" 
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(10px)",
      border: `1px solid ${theme.palette.mode === "dark" 
        ? "rgba(255, 255, 255, 0.1)" 
        : "rgba(0, 0, 0, 0.1)"}`,
    },
  };

  return {
    ...baseStyles,
    ...(customVariant && variantStyles[customVariant as keyof typeof variantStyles]),
  };
});

/**
 * Enhanced Card component with variants:
 * - default: Standard MUI card
 * - elevated: Card with elevation and hover effects
 * - outlined: Card with border, no background
 * - glass: Glassmorphism effect with backdrop blur
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", children, ...props }, ref) => {
    return (
      <StyledCard ref={ref} customVariant={variant} {...props}>
        {children}
      </StyledCard>
    );
  }
);

Card.displayName = "Card";

export default Card;

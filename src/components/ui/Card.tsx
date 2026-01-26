"use client";
import { Card as BSCard, CardProps as BSCardProps } from "react-bootstrap";
import { forwardRef, ReactNode } from "react";

export interface CardProps extends BSCardProps {
  variant?: "default" | "elevated" | "outlined" | "glass";
  children: ReactNode;
}

/**
 * Enhanced Card component with variants:
 * - default: Standard Bootstrap card
 * - elevated: Card with elevation and hover effects
 * - outlined: Card with border, no background
 * - glass: Glassmorphism effect with backdrop blur
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    const variantClass = {
      default: "",
      elevated: "card-elevated",
      outlined: "border-2",
      glass: "card-glass",
    }[variant];

    const combinedClassName = `${variantClass} ${className}`.trim();

    return (
      <BSCard ref={ref} className={combinedClassName} {...props}>
        {children}
      </BSCard>
    );
  }
);

Card.displayName = "Card";

export default Card;

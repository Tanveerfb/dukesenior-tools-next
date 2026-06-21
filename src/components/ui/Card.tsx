"use client";
import { forwardRef, ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "glass";
  children: ReactNode;
}

const variantClasses: Record<string, string> = {
  default:
    "bg-card dark:bg-card-dark border-2 border-dashed border-border dark:border-border-dark rounded-md shadow-soft",
  elevated:
    "bg-card dark:bg-card-dark border-2 border-dashed border-border dark:border-border-dark rounded-md shadow-soft hover:shadow-soft-lg hover:-translate-y-1 hover:rotate-[-0.3deg] transition-all duration-300",
  outlined:
    "bg-transparent border-2 border-dashed border-border dark:border-border-dark rounded-md shadow-none",
  glass: "glass rounded-md",
};

/**
 * Enhanced Card component with variants:
 * - default: Standard card with subtle shadow
 * - elevated: Card with elevation and hover effects
 * - outlined: Card with border, no background
 * - glass: Glassmorphism effect with backdrop blur
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

export default Card;

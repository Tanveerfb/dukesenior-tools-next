/**
 * Bootstrap to MUI Migration Components
 *
 * These components provide drop-in replacements for common react-bootstrap components
 * using MUI equivalents. This allows for easier migration with minimal code changes.
 */

import {
  Alert as MuiAlert,
  Card as MuiCard,
  CardContent,
  Button as MuiButton,
  Box,
  type AlertProps,
  type CardProps,
  type ButtonProps,
} from "@mui/material";
import { ReactNode } from "react";

// Alert component - maps Bootstrap variants to MUI severity
export function Alert({
  variant = "info",
  children,
  ...props
}: {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark";
  children: ReactNode;
  className?: string;
}) {
  const severityMap: Record<string, AlertProps["severity"]> = {
    primary: "info",
    secondary: "info",
    success: "success",
    danger: "error",
    warning: "warning",
    info: "info",
    light: "info",
    dark: "info",
  };

  return (
    <MuiAlert severity={severityMap[variant]} {...props}>
      {children}
    </MuiAlert>
  );
}

// Card component - simple wrapper
export function Card({
  children,
  className,
  ...props
}: CardProps & { children: ReactNode }) {
  return (
    <MuiCard {...props} className={className}>
      {children}
    </MuiCard>
  );
}

Card.Body = function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <CardContent className={className}>{children}</CardContent>;
};

Card.Header = function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Box
      sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}
      className={className}
    >
      {children}
    </Box>
  );
};

Card.Title = function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Box
      component="h5"
      sx={{ fontSize: "1.25rem", fontWeight: 500, mb: 1 }}
      className={className}
    >
      {children}
    </Box>
  );
};

// Button component - maps Bootstrap variants to MUI colors
export function Button({
  variant = "primary",
  size,
  children,
  ...props
}: Omit<ButtonProps, "variant" | "size"> & {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark"
    | "link"
    | "outline-primary"
    | "outline-secondary";
  size?: "sm" | "lg";
}) {
  const colorMap: Record<string, ButtonProps["color"]> = {
    primary: "primary",
    secondary: "secondary",
    success: "success",
    danger: "error",
    warning: "warning",
    info: "info",
    light: "inherit",
    dark: "inherit",
    link: "inherit",
    "outline-primary": "primary",
    "outline-secondary": "secondary",
  };

  const variantMap: Record<string, ButtonProps["variant"]> = {
    link: "text",
  };

  const isOutline = variant.startsWith("outline-");
  const muiVariant = isOutline
    ? "outlined"
    : variantMap[variant] || "contained";
  const muiColor = colorMap[variant] || "primary";
  const muiSize = size === "sm" ? "small" : size === "lg" ? "large" : "medium";

  return (
    <MuiButton variant={muiVariant} color={muiColor} size={muiSize} {...props}>
      {children}
    </MuiButton>
  );
}

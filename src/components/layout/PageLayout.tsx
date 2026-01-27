"use client";

import { ReactNode } from "react";
import { Box, Container, Typography, Breadcrumbs, Link as MuiLink } from "@mui/material";
import { NavigateNext as NavigateNextIcon } from "@mui/icons-material";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  /** Optional hero title */
  title?: string;
  /** Optional hero subtitle/description */
  subtitle?: string;
  /** Optional breadcrumb items */
  breadcrumbs?: Array<{ label: string; href?: string }>;
  /** Hero background variant */
  heroVariant?: "primary" | "secondary" | "success" | "warning" | "info" | "none";
  /** Max width for content container */
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  /** Additional className for the root element */
  className?: string;
}

export default function PageLayout({
  children,
  title,
  subtitle,
  breadcrumbs,
  heroVariant = "primary",
  maxWidth = "xl",
  className,
}: PageLayoutProps) {
  const hasHero = title || subtitle || breadcrumbs;

  const getHeroBackground = () => {
    switch (heroVariant) {
      case "primary":
        return "linear-gradient(115deg, rgba(171, 47, 177, 0.12), rgba(54, 69, 59, 0.1))";
      case "secondary":
        return "linear-gradient(115deg, rgba(54, 69, 59, 0.12), rgba(18, 19, 15, 0.08))";
      case "success":
        return "linear-gradient(115deg, rgba(15, 128, 41, 0.12), rgba(54, 69, 59, 0.08))";
      case "warning":
        return "linear-gradient(115deg, rgba(255, 202, 58, 0.18), rgba(171, 47, 177, 0.12))";
      case "info":
        return "linear-gradient(115deg, rgba(137, 96, 142, 0.18), rgba(171, 47, 177, 0.12))";
      case "none":
        return "transparent";
      default:
        return "linear-gradient(115deg, rgba(171, 47, 177, 0.12), rgba(54, 69, 59, 0.1))";
    }
  };

  return (
    <Box className={cn("page-layout", className)}>
      {/* Hero Section */}
      {hasHero && (
        <Box
          sx={{
            background: getHeroBackground(),
            borderBottom: 1,
            borderColor: "divider",
            py: { xs: 3, md: 4 },
          }}
        >
          <Container maxWidth={maxWidth}>
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
                sx={{ mb: 2 }}
              >
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return crumb.href && !isLast ? (
                    <MuiLink
                      key={index}
                      component={Link}
                      href={crumb.href}
                      color="inherit"
                      underline="hover"
                    >
                      {crumb.label}
                    </MuiLink>
                  ) : (
                    <Typography key={index} color="text.primary">
                      {crumb.label}
                    </Typography>
                  );
                })}
              </Breadcrumbs>
            )}

            {/* Title */}
            {title && (
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", md: "2.5rem" },
                }}
              >
                {title}
              </Typography>
            )}

            {/* Subtitle */}
            {subtitle && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontSize: { xs: "0.95rem", md: "1.1rem" },
                  maxWidth: "800px",
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Container>
        </Box>
      )}

      {/* Main Content */}
      <Container maxWidth={maxWidth} sx={{ py: { xs: 3, md: 4 } }}>
        {children}
      </Container>
    </Box>
  );
}

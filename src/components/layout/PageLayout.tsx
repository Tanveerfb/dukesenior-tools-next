"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FiChevronRight } from "react-icons/fi";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  heroVariant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "info"
    | "none";
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  className?: string;
}

const heroGradients: Record<string, string> = {
  primary:
    "bg-gradient-to-br from-primary/10 via-surface-50 to-secondary/5 dark:from-primary/5 dark:via-background-dark dark:to-secondary/5",
  secondary:
    "bg-gradient-to-br from-secondary/10 via-surface-50 to-surface-100 dark:from-secondary/5 dark:via-background-dark dark:to-surface-900",
  success:
    "bg-gradient-to-br from-success/10 via-surface-50 to-surface-100 dark:from-success/5 dark:via-background-dark dark:to-surface-900",
  warning:
    "bg-gradient-to-br from-warning/15 via-surface-50 to-primary/5 dark:from-warning/5 dark:via-background-dark dark:to-primary/5",
  info: "bg-gradient-to-br from-info/15 via-surface-50 to-primary/5 dark:from-info/5 dark:via-background-dark dark:to-primary/5",
  none: "",
};

const maxWidthMap: Record<string, string> = {
  xs: "max-w-md",
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
};

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
  const containerClass = maxWidth
    ? `${maxWidthMap[maxWidth] || "max-w-7xl"} mx-auto px-4 sm:px-6 lg:px-8`
    : "px-4 sm:px-6 lg:px-8";

  return (
    <div className={cn("page-layout", className)}>
      {/* Hero Section */}
      {hasHero && (
        <div
          className={cn(
            "border-b-2 border-dashed border-border dark:border-border-dark py-6 md:py-8",
            heroGradients[heroVariant] || heroGradients.primary,
          )}
        >
          <div className={containerClass}>
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav
                aria-label="breadcrumb"
                className="flex items-center gap-1 text-sm mb-4"
              >
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <span key={index} className="flex items-center gap-1">
                      {index > 0 && (
                        <FiChevronRight
                          size={14}
                          className="text-foreground-muted dark:text-foreground-dark-muted"
                        />
                      )}
                      {crumb.href && !isLast ? (
                        <Link
                          href={crumb.href}
                          className="text-foreground-muted dark:text-foreground-dark-muted hover:text-primary transition-colors no-underline"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-foreground dark:text-foreground-dark font-medium">
                          {crumb.label}
                        </span>
                      )}
                    </span>
                  );
                })}
              </nav>
            )}

            {/* Title */}
            {title && (
              <h1 className="text-2xl md:text-4xl font-bold text-foreground dark:text-foreground-dark mb-2">
                {title}
              </h1>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p className="text-sm md:text-base text-foreground-muted dark:text-foreground-dark-muted max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={cn(containerClass, "py-6 md:py-8")}>{children}</div>
    </div>
  );
}

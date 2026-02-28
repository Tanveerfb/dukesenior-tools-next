"use client";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import InlineLink from "@/components/ui/InlineLink";

export type TourneyBreadcrumb = {
  label: string;
  href?: string;
};

export type TourneyHeroAction = {
  label: string;
  href: string;
  variant?: string;
  icon?: ReactNode;
};

export type TourneyHeroBadge = {
  label: string;
  variant?: string;
};

const badgeVariantMap: Record<string, string> = {
  primary: "bg-primary-500 text-white",
  secondary: "bg-gray-500 text-white",
  success: "bg-green-500 text-white",
  warning: "bg-yellow-500 text-black",
  info: "bg-cyan-500 text-white",
  danger: "bg-red-500 text-white",
};

const actionVariantMap: Record<string, string> = {
  "outline-light":
    "border border-white/60 text-white hover:bg-white/10 transition-colors",
  primary: "bg-primary-500 text-white hover:bg-primary-600 transition-colors",
  "outline-primary":
    "border border-primary-500 text-primary-500 hover:bg-primary-500/10 transition-colors",
};

type TourneyHeroProps = {
  title: string;
  subtitle?: string;
  breadcrumbs: TourneyBreadcrumb[];
  badges?: TourneyHeroBadge[];
  actions?: TourneyHeroAction[];
  accent?: "primary" | "secondary" | "success" | "warning" | "info";
  extra?: ReactNode;
};

export function TourneyHero({
  title,
  subtitle,
  breadcrumbs,
  badges,
  actions,
  accent = "primary",
  extra,
}: TourneyHeroProps) {
  return (
    <div className={cn("w-full", `tourney-hero tourney-hero-${accent}`)}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col gap-3 py-3">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-sm m-0 list-none p-0">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li
                    key={`${crumb.label}-${index}`}
                    className={cn(
                      "flex items-center",
                      isLast || !crumb.href
                        ? "text-foreground-secondary"
                        : "text-foreground",
                    )}
                  >
                    {index > 0 && (
                      <span className="mx-1.5 text-foreground-secondary">
                        /
                      </span>
                    )}
                    {crumb.href && !isLast ? (
                      <InlineLink href={crumb.href} className="hover:underline">
                        {crumb.label}
                      </InlineLink>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
            <div className="flex flex-col gap-2">
              {badges && badges.length > 0 && (
                <div className="flex flex-row flex-wrap gap-2">
                  {badges.map((badge) => (
                    <span
                      key={badge.label}
                      className={cn(
                        "rounded-full text-xs font-medium px-2.5 py-0.5",
                        badgeVariantMap[badge.variant ?? "secondary"] ??
                          badgeVariantMap.secondary,
                      )}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              )}
              <div>
                <h1 className="text-xl font-semibold mb-1 text-foreground">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-foreground-secondary mb-0">{subtitle}</p>
                )}
              </div>
            </div>

            {actions && actions.length > 0 && (
              <div className="flex flex-row flex-wrap gap-2">
                {actions.map((action) => (
                  <InlineLink
                    key={action.label}
                    href={action.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium no-underline",
                      actionVariantMap[action.variant ?? "outline-light"] ??
                        actionVariantMap["outline-light"],
                    )}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </InlineLink>
                ))}
              </div>
            )}
          </div>

          {extra}
        </div>
      </div>
    </div>
  );
}

export default TourneyHero;

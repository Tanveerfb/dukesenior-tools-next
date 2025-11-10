"use client";
import { ReactNode } from "react";
import { Badge, Breadcrumb, Button, Container, Stack } from "react-bootstrap";
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
    <Container fluid className={`tourney-hero tourney-hero-${accent}`}>
      <Container>
        <Stack gap={3} className="py-3">
          <Breadcrumb className="small m-0">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <Breadcrumb.Item
                  key={`${crumb.label}-${index}`}
                  linkAs={InlineLink as any}
                  linkProps={crumb.href ? { href: crumb.href } : undefined}
                  href={crumb.href}
                  active={isLast || !crumb.href}
                >
                  {crumb.label}
                </Breadcrumb.Item>
              );
            })}
          </Breadcrumb>

          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
            <div className="d-flex flex-column gap-2">
              {badges && badges.length > 0 && (
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {badges.map((badge) => (
                    <Badge key={badge.label} bg={badge.variant ?? "secondary"}>
                      {badge.label}
                    </Badge>
                  ))}
                </Stack>
              )}
              <div>
                <h1 className="h3 mb-1">{title}</h1>
                {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
              </div>
            </div>

            {actions && actions.length > 0 && (
              <Stack direction="horizontal" gap={2} className="flex-wrap">
                {actions.map((action) => (
                  <Button
                    key={action.label}
                    variant={action.variant ?? "outline-light"}
                    as={InlineLink as any}
                    href={action.href}
                    className="d-flex align-items-center gap-2"
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </Button>
                ))}
              </Stack>
            )}
          </div>

          {extra}
        </Stack>
      </Container>
    </Container>
  );
}

export default TourneyHero;

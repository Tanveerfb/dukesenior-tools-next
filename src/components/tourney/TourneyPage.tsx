"use client";
import { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";
import TourneyHero, {
  type TourneyBreadcrumb,
  type TourneyHeroAction,
  type TourneyHeroBadge,
} from "./TourneyHero";

type TourneyPageProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  breadcrumbs: TourneyBreadcrumb[];
  badges?: TourneyHeroBadge[];
  actions?: TourneyHeroAction[];
  accent?: "primary" | "secondary" | "success" | "warning" | "info";
  extraHeader?: ReactNode;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
}>;

export default function TourneyPage({
  title,
  subtitle,
  breadcrumbs,
  badges,
  actions,
  accent,
  extraHeader,
  containerProps,
  children,
}: TourneyPageProps) {
  return (
    <>
      <TourneyHero
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        badges={badges}
        actions={actions}
        accent={accent}
        extra={extraHeader}
      />
      <div
        {...containerProps}
        className={cn("max-w-7xl mx-auto px-4 py-4", containerProps?.className)}
      >
        {children}
      </div>
    </>
  );
}

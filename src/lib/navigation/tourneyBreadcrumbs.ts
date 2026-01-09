import type { TourneyBreadcrumb } from "@/components/tourney/TourneyHero";

const SERIES_BASE: TourneyBreadcrumb[] = [
  { label: "Home", href: "/" },
  { label: "Phasmo Tourney Series", href: "/phasmotourney-series" },
];

export function buildTourneyBreadcrumbs(
  trail: TourneyBreadcrumb[]
): TourneyBreadcrumb[] {
  return [
    ...SERIES_BASE.map((crumb) => ({ ...crumb })),
    ...trail.map((crumb) => ({ ...crumb })),
  ];
}

export function getSeriesBaseBreadcrumbs(): TourneyBreadcrumb[] {
  return SERIES_BASE.map((crumb) => ({ ...crumb }));
}

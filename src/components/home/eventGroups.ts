import { taggedManifest } from "@/lib/content/tags";
import type { TaggedRouteMeta } from "@/types/tags";

export type EventStatus = "Current" | "Past" | "Unknown";

export interface EventGroup {
  eventTag: string;
  displayName: string;
  status: EventStatus;
  routes: TaggedRouteMeta[];
  primaryRoute: TaggedRouteMeta;
  extraRoutes: TaggedRouteMeta[];
}

const EVENT_TAG_PATTERN = /^PhasmoTourney(\d+)$/;
const DYNAMIC_SEGMENT_PATTERN = /\[[^\]]+\]/g;

function inferEventTag(tags: string[]): string | null {
  return tags.find((tag) => EVENT_TAG_PATTERN.test(tag)) ?? null;
}

function inferStatus(tags: string[]): EventStatus {
  if (tags.includes("Current")) return "Current";
  if (tags.includes("Past")) return "Past";
  return "Unknown";
}

function formatDisplayName(eventTag: string): string {
  const match = eventTag.match(EVENT_TAG_PATTERN);
  if (!match) return eventTag;
  return `Tourney ${match[1]}`;
}

function sortByEventNumberDesc(a: string, b: string): number {
  const parseNumber = (tag: string) => {
    const match = tag.match(EVENT_TAG_PATTERN);
    return match ? Number.parseInt(match[1], 10) : 0;
  };

  return parseNumber(b) - parseNumber(a);
}

function buildGroup(
  routes: TaggedRouteMeta[],
  status: EventStatus,
  eventTag: string
): EventGroup | null {
  if (routes.length === 0) return null;
  const sortedRoutes = [...routes].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
  const primaryRoute =
    sortedRoutes.find((route) => route.tags.includes("Bracket")) ??
    sortedRoutes[0];
  const extraRoutes = sortedRoutes
    .filter(
      (route) => route !== primaryRoute && !route.tags.includes("Details")
    )
    .sort((a, b) => a.title.localeCompare(b.title));

  return {
    eventTag,
    displayName: formatDisplayName(eventTag),
    status,
    routes: sortedRoutes,
    primaryRoute,
    extraRoutes,
  };
}

export function normalizeRoutePath(path: string): string {
  return path.replace(DYNAMIC_SEGMENT_PATTERN, "sample");
}

export function getEventGroupsByStatus(status: EventStatus): EventGroup[] {
  const grouped = new Map<
    string,
    { status: EventStatus; routes: TaggedRouteMeta[] }
  >();

  taggedManifest.forEach((meta) => {
    if (!meta.tags.includes("Event")) return;
    const inferredStatus = inferStatus(meta.tags);
    if (status !== "Unknown" && inferredStatus !== status) return;

    const eventTag = inferEventTag(meta.tags);
    if (!eventTag) return;

    const bucket = grouped.get(eventTag) ?? {
      status: inferredStatus,
      routes: [],
    };
    bucket.routes.push(meta);
    grouped.set(eventTag, bucket);
  });

  return Array.from(grouped.entries())
    .sort((a, b) => sortByEventNumberDesc(a[0], b[0]))
    .map(([eventTag, value]) =>
      buildGroup(value.routes, value.status, eventTag)
    )
    .filter((group): group is EventGroup => group !== null);
}

export function getFeaturedEventGroup(): EventGroup | null {
  const current = getEventGroupsByStatus("Current");
  if (current.length > 0) return current[0];

  const past = getEventGroupsByStatus("Past");
  return past.length > 0 ? past[0] : null;
}

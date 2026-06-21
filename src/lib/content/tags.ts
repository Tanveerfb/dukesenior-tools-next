// Central tag utilities (initial lightweight version)
// Conventions: PascalCase domain tags, SpecificRole tags, Status tags (Current|Past)
// Example: PhasmoTourney4, Bracket, Standings, RecordedRuns, Stats, Event, Current
// Shared types live in src/types/tags.ts

import type { TaggedRouteMeta } from "@/types/tags";
export type PageTag = string; // Backwards compatibility alias

// Manual manifest seed (can be augmented programmatically later)
// NOTE: public Phasmo Tourney pages (1‑5) were moved to the top‑level
// `archive/` directory and removed from the application.  only the
// remaining admin endpoints are kept here for now; everything else would
// generate broken links if left in the manifest.
export const taggedManifest: TaggedRouteMeta[] = [
  // Tools
  {
    path: "/house-duties",
    title: "House Duties Checklist",
    tags: ["Tool", "Productivity", "Current"],
    description:
      "Create and manage 7-day checklists for house duties and responsibilities",
  },

  // Gamification Pages
  {
    path: "/leaderboard",
    title: "Leaderboard",
    tags: ["Gamification", "Leaderboard", "Tool"],
    description: "View the global leaderboard and compete with other members",
  },
  {
    path: "/stats",
    title: "My Stats",
    tags: ["Gamification", "Stats", "Tool"],
    description: "View your personal gamification stats and achievements",
  },
  {
    path: "/admin/gamification",
    title: "Admin - Gamification",
    tags: ["Admin", "Gamification"],
    description: "Admin tools for managing gamification system",
  },
];

export function findByTag(tag: PageTag) {
  return taggedManifest.filter((r) => r.tags.includes(tag));
}
export function filterRoutes(fn: (meta: TaggedRouteMeta) => boolean) {
  return taggedManifest.filter(fn);
}
export function listAllTags(): PageTag[] {
  const set = new Set<PageTag>();
  taggedManifest.forEach((r) => r.tags.forEach((t) => set.add(t)));
  return Array.from(set).sort();
}

// Central tag utilities (initial lightweight version)
// Conventions: PascalCase domain tags, SpecificRole tags, Status tags (Current|Past)
// Example: PhasmoTourney4, Bracket, Standings, RecordedRuns, Stats, Event, Current
// Shared types live in src/types/tags.ts

import type { TaggedRouteMeta } from "@/types/tags";
export type PageTag = string; // Backwards compatibility alias

// Manual manifest seed (can be augmented programmatically later)
export const taggedManifest: TaggedRouteMeta[] = [
  // Tourney 5 (new - current)
  {
    path: "/phasmotourney-series/phasmotourney5",
    title: "Tourney 5 Bracket",
    tags: ["PhasmoTourney5", "Bracket", "Event", "Current"],
  },
  {
    path: "/phasmotourney-series/phasmotourney5/runs",
    title: "Tourney 5 Recorded Runs",
    tags: ["PhasmoTourney5", "RecordedRuns", "Event", "Current"],
  },
  {
    path: "/phasmotourney-series/phasmotourney5/runs/[id]",
    title: "Tourney 5 Run Details",
    tags: ["PhasmoTourney5", "RecordedRuns", "Details", "Event", "Current"],
  },
  {
    path: "/phasmotourney-series/phasmotourney5/round2-leaderboard",
    title: "Tourney 5 Round 2 Leaderboard",
    tags: ["PhasmoTourney5", "Leaderboard", "Event", "Current"],
  },
  {
    path: "/phasmotourney-series/phasmotourney5/stats",
    title: "Tourney 5 Stats",
    tags: ["PhasmoTourney5", "Stats", "Event", "Current"],
  },
  {
    path: "/phasmotourney-series/phasmotourney5/players",
    title: "Tourney 5 Players",
    tags: ["PhasmoTourney5", "Players", "Event", "Current"],
  },
  // Tourney 4 (now under series)
  {
    path: "/phasmotourney-series/phasmotourney4",
    title: "Tourney 4 Bracket",
    tags: ["PhasmoTourney4", "Bracket", "Event", "Past"],
  },
  {
    path: "/phasmotourney-series/phasmotourney4/runs",
    title: "Tourney 4 Recorded Runs",
    tags: ["PhasmoTourney4", "RecordedRuns", "Event", "Past"],
  },
  {
    path: "/phasmotourney-series/phasmotourney4/runs/[id]",
    title: "Tourney 4 Run Details",
    tags: ["PhasmoTourney4", "RecordedRuns", "Details", "Event", "Past"],
  },
  {
    path: "/phasmotourney-series/phasmotourney4/standings",
    title: "Tourney 4 Standings",
    tags: ["PhasmoTourney4", "Standings", "Event", "Past"],
  },
  {
    path: "/phasmotourney-series/phasmotourney4/stats",
    title: "Tourney 4 Stats",
    tags: ["PhasmoTourney4", "Stats", "Event", "Past"],
  },
  // Tourney 3 (now under series) - unified runs + run details under /runs
  {
    path: "/phasmotourney-series/phasmotourney3",
    title: "Tourney 3 Bracket",
    tags: ["PhasmoTourney3", "Bracket", "Event", "Past"],
  },
  {
    path: "/phasmotourney-series/phasmotourney3/runs",
    title: "Tourney 3 Recorded Runs",
    tags: ["PhasmoTourney3", "RecordedRuns", "Event", "Past"],
  },
  {
    path: "/phasmotourney-series/phasmotourney3/runs/[id]",
    title: "Tourney 3 Run Details",
    tags: ["PhasmoTourney3", "RecordedRuns", "Details", "Event", "Past"],
  },
  {
    path: "/phasmotourney-series/phasmotourney3/standings",
    title: "Tourney 3 Standings",
    tags: ["PhasmoTourney3", "Standings", "Event", "Past"],
  },
  {
    path: "/phasmotourney-series/phasmotourney3/players",
    title: "Tourney 3 Players",
    tags: ["PhasmoTourney3", "Players", "Event", "Past"],
  },
  // Tourney 2 (now under series)
  {
    path: "/phasmotourney-series/phasmotourney2",
    title: "Tourney 2",
    tags: ["PhasmoTourney2", "Event", "Past"],
  },
  {
    path: "/phasmotourney-series/phasmotourney2/records",
    title: "Tourney 2 Records",
    tags: ["PhasmoTourney2", "RecordedRuns", "Event", "Past"],
  },
  {
    path: "/phasmotourney-series/phasmotourney2/[id]",
    title: "Tourney 2 Run Details",
    tags: ["PhasmoTourney2", "RecordedRuns", "Details", "Event", "Past"],
  },
  // Tourney 1 (now under series)
  {
    path: "/phasmotourney-series/phasmotourney1",
    title: "Tourney 1",
    tags: ["PhasmoTourney1", "Event", "Past"],
  },
  {
    path: "/phasmotourney-series/phasmotourney1/records",
    title: "Tourney 1 Records",
    tags: ["PhasmoTourney1", "RecordedRuns", "Event", "Past"],
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

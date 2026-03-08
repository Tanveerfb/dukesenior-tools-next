// Legacy tournament classification helpers
// The site previously built a dedicated "Events" dropdown using
// 'taggedManifest' entries and route heuristics. All tournament pages have
// archived off in the top‑level `archive/` folder and are no longer part
// of the application, so this module is effectively dead code. We keep it here
// as documentation in case the archive gets resurrected, but nothing in the
// current workspace imports these exports.

import type { EffectiveMeta } from "@/types/tags";

// noop stubs that satisfy potential downstream imports (none today)
export function tournamentKey(_path: string, _tags: string[]): string | null {
  return null;
}

export function classifyEvents(_effective: EffectiveMeta[]) {
  return { currentGroups: {}, pastGroups: {}, currentKeys: [], pastKeys: [] };
}

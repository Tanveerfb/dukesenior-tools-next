import type { EffectiveMeta } from "@/types/tags";

type Grouped = Record<string, EffectiveMeta[]>;

// Derive a human-friendly tournament key from tags or fallback path heuristics
export function tournamentKey(path: string, tags: string[]): string | null {
  const tag = tags.find((t) => /^PhasmoTourney\d+$/i.test(t));
  if (tag) return tag.replace("PhasmoTourney", "Tourney ");
  // fallback path heuristics for legacy paths
  if (/tourney4/i.test(path)) return "Tourney 4";
  if (/tourney3/i.test(path)) return "Tourney 3";
  if (/tourney2/i.test(path)) return "Tourney 2";
  if (/tourney1|phasmotourneyData/i.test(path)) return "Tourney 1";
  return null;
}

function sortGroupKeys(groups: Grouped, reverse = false) {
  return Object.keys(groups).sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, "")) || 0;
    const nb = parseInt(b.replace(/\D/g, "")) || 0;
    return reverse ? nb - na : na - nb;
  });
}

// Build groupings for Events dropdown: current vs past + sorted keys
export function classifyEvents(effective: EffectiveMeta[]) {
  const currentGroups: Grouped = {};
  const pastGroups: Grouped = {};

  effective
    .filter((m) => m.effective.includes("Event"))
    .forEach((m) => {
      // Exclude dynamic detail pages (any route containing a dynamic segment)
      if (m.path.includes("[")) return;
      const key = tournamentKey(m.path, m.effective);
      if (!key) return;
      const target = m.effective.includes("Current")
        ? currentGroups
        : pastGroups;
      if (!target[key]) target[key] = [];
      target[key].push(m);
    });

  const currentKeys = sortGroupKeys(currentGroups, true);
  const pastKeys = sortGroupKeys(pastGroups, true);

  return { currentGroups, pastGroups, currentKeys, pastKeys };
}

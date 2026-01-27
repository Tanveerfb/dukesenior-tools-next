import type { TournamentMeta, TournamentOverview } from "@/types/archive";

export const TOURNAMENT_METADATA: TournamentMeta[] = [
  {
    id: "t4",
    title: "Phasmo Tourney 4",
    shortTitle: "T4",
    format: "Dual Bracket + Playoffs",
    winner: "Gynx",
    participants: 14,
    totalMatches: 65,
    year: 2023,
    status: "completed",
    themeColor: "#AB2FB1",
    description:
      "Dual-bracket showdown featuring the playoff gauntlet and comprehensive stat dashboards.",
  },
  {
    id: "t3",
    title: "Phasmo Tourney 3",
    shortTitle: "T3",
    format: "Team Tournament",
    winner: "Team 2 (Grumpy yeti & Ranveer)",
    participants: 16,
    totalMatches: 16,
    year: 2023,
    status: "completed",
    themeColor: "#36453B",
    description:
      "The toughest duo battles yet, complete with recorded runs and standings.",
  },
  {
    id: "t2",
    title: "Phasmo Tourney 2",
    shortTitle: "T2",
    format: "Single Elimination",
    winner: "Grumpy yeti",
    participants: 12,
    totalMatches: 11,
    year: 2023,
    status: "completed",
    themeColor: "#0F8029",
    description:
      "Expanded field, revamped scoring, and the return of crowd favourites.",
  },
  {
    id: "t1",
    title: "Phasmo Tourney 1",
    shortTitle: "T1",
    format: "Single Elimination",
    winner: "Grumpy yeti",
    participants: 8,
    totalMatches: 7,
    year: 2022,
    status: "completed",
    themeColor: "#89608E",
    description:
      "Where it all began—original bracket, tools, and community highlights.",
  },
];

export const TOURNAMENT_OVERVIEWS: Record<string, TournamentOverview> = {
  t4: {
    id: "t4",
    title: "Phasmo Tourney 4",
    format: "Dual Bracket + Playoffs",
    description:
      "The fourth iteration of The Lair of Evil's Phasmo Tourney featured a revolutionary dual-bracket format, splitting 14 competitors into two pools before culminating in an intense playoff gauntlet. The tournament showcased advanced scoring mechanics and comprehensive statistics tracking.",
    winner: "Gynx",
    runnerUp: "Fayrore",
    participants: 14,
    totalMatches: 65,
    year: 2023,
    highlights: [
      "First dual-bracket format with playoff system",
      "14 players competed across Bracket 1 and Bracket 2",
      "Comprehensive statistics and performance tracking",
      "Gynx dominated the playoffs to claim the championship",
      "Featured best-out-of-three finale matches",
    ],
  },
  t3: {
    id: "t3",
    title: "Phasmo Tourney 3",
    format: "Team Tournament",
    description:
      "Phasmo Tourney 3 introduced team-based competition with 8 duos battling through rounds of elimination and redemption. The tournament featured complex scoring across multiple objectives and timed challenges on progressively difficult maps.",
    winner: "Team 2 (Grumpy yeti & Ranveer)",
    runnerUp: "Team 1",
    participants: 16,
    totalMatches: 16,
    year: 2023,
    highlights: [
      "First team-based tournament with 8 duos",
      "Redemption bracket allowed eliminated teams second chances",
      "Complex scoring: objectives, time, ghost identification",
      "Progressive difficulty: Grafton → Willow → Bleasdale → Sunny Meadows",
      "Best-of-three finals determined the champion duo",
    ],
  },
  t2: {
    id: "t2",
    title: "Phasmo Tourney 2",
    format: "Single Elimination",
    description:
      "Building on the success of the inaugural tournament, Phasmo Tourney 2 expanded to 12 participants with refined scoring mechanics. The single-elimination format created high-stakes matches where every run counted.",
    winner: "Grumpy yeti",
    runnerUp: "Bobyourit",
    participants: 12,
    totalMatches: 11,
    year: 2023,
    highlights: [
      "Expanded field of 12 competitors",
      "Refined scoring with time bonuses",
      "Introduction of perfect game achievements",
      "Grumpy yeti defended the crown",
      "Established community favorite players",
    ],
  },
  t1: {
    id: "t1",
    title: "Phasmo Tourney 1",
    format: "Single Elimination",
    description:
      "The tournament that started it all. Eight brave ghost hunters competed in a classic single-elimination bracket, establishing the foundation for the legendary Phasmo Tourney series at The Lair of Evil.",
    winner: "Grumpy yeti",
    runnerUp: "Ranveer",
    participants: 8,
    totalMatches: 7,
    year: 2022,
    highlights: [
      "Inaugural tournament of the series",
      "8 competitors in classic bracket format",
      "Established core scoring mechanics",
      "Grumpy yeti emerged as the first champion",
      "Foundation for future tournament innovations",
    ],
  },
};

export function getTournamentMeta(id: string): TournamentMeta | undefined {
  return TOURNAMENT_METADATA.find((t) => t.id === id);
}

export function getTournamentOverview(id: string): TournamentOverview | undefined {
  return TOURNAMENT_OVERVIEWS[id];
}

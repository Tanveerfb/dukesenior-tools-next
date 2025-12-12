// Pure stats helpers for Phasmo Tourney 4.
// Intentionally Firebase-free so it can be tested with Vitest without Next/Vite alias config.

export interface RawPlayerStats {
  name: string;
  totalScore: number;
  matchesPlayer: number;
  streak?: number;
  bestStreak?: number;
}

export function computeTopAveragePlayers(players: RawPlayerStats[], topN = 5) {
  return players
    .map((player) => ({
      ...player,
      avgScore:
        player.matchesPlayer > 0
          ? Number((player.totalScore / player.matchesPlayer).toFixed(2))
          : 0,
    }))
    .sort((a, b) => b.avgScore - a.avgScore || a.name.localeCompare(b.name))
    .slice(0, topN);
}

export function computeTopBestStreak(players: RawPlayerStats[], topN = 5) {
  return players
    .map((player) => ({ ...player, best: player.bestStreak || 0 }))
    .sort((a, b) => b.best - a.best || a.name.localeCompare(b.name))
    .slice(0, topN);
}

export const T5_ROUNDS = [
  { roundNumber: 1, name: "Standard Round" },
  { roundNumber: 2, name: "Money Round" },
  { roundNumber: 3, name: "Money Team ups" },
  { roundNumber: 4, name: "Twitch Chat Round" },
  { roundNumber: 5, name: "Tourney 5 Special" },
  { roundNumber: 6, name: "Pick your best friend" },
  { roundNumber: 7, name: "Ultimate Finale" },
];

export async function getT5Overview() {
  return {
    currentRoundNumber: 2,
    nowText: "Round 2: Money Round",
    nextText: "Round 3: Money Team ups",
    remainingPlayersCount: 8,
  };
}

export async function getT5Players() {
  return [
    { id: "p1", displayName: "Player One", status: "active", immunities: [1] },
    { id: "p2", displayName: "Player Two", status: "active" },
    { id: "p3", displayName: "Player Three", status: "eliminated" },
    {
      id: "p4",
      displayName: "Player Four",
      status: "active",
      immunities: [2, 3],
    },
  ];
}

export async function getT5Rounds() {
  return T5_ROUNDS.map((r) => ({
    ...r,
    status:
      r.roundNumber < 2
        ? "completed"
        : r.roundNumber === 2
        ? "live"
        : "upcoming",
  }));
}

export async function getT5RoundDetail(roundNumber: number) {
  const round = T5_ROUNDS.find((r) => r.roundNumber === roundNumber) || {
    roundNumber,
    name: `Round ${roundNumber}`,
  };
  return {
    roundNumber: round.roundNumber,
    name: round.name,
    rulesText: `Rules for ${round.name} - placeholder text.`,
    placeholders: { standings: true, eliminations: true, immunities: true },
  };
}

export async function getT5Leaderboard() {
  return [
    { playerId: "p1", displayName: "Player One", score: 1200 },
    { playerId: "p2", displayName: "Player Two", score: 900 },
    { playerId: "p4", displayName: "Player Four", score: 800 },
  ];
}

export async function getT5OverlayState() {
  return {
    nowText: "Now: Round 2 - Money Round",
    nextText: "Next: Round 3 - Money Team ups",
    featuredMatchupId: "match-demo",
  };
}

export async function getT5MatchupCard(matchId: string) {
  // deterministic mock based on matchId
  return {
    matchId,
    roundNumber: 2,
    title: matchId ? `Match: ${matchId}` : `Match: demo`,
    subtitle: "Map: Edgefield - Settings: Standard",
    leftPlayer: { id: "p1", name: "Player One" },
    rightPlayer: { id: "p2", name: "Player Two" },
  };
}

export async function isT5Player(uid?: string, email?: string) {
  // TODO: replace with Firestore participant/tag check later.
  return true;
}

import React from "react";
import { getT5Leaderboard } from "../../../../../lib/services/phasmoTourney5";

export default async function LeaderboardPage() {
  const rows = await getT5Leaderboard();
  return (
    <div>
      <h2>Leaderboard</h2>
      <ol>
        {rows.map((r) => (
          <li key={r.playerId}>
            {r.displayName} — {r.score}
          </li>
        ))}
      </ol>
    </div>
  );
}

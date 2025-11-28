import React from "react";
import { getT5Leaderboard } from "../../../../../../lib/services/phasmoTourney5";

export const revalidate = 0;

export default async function LeaderboardOverlay() {
  const rows = await getT5Leaderboard();
  return (
    <div>
      <ol>
        {rows.slice(0, 5).map((r) => (
          <li key={r.playerId}>
            {r.displayName} — {r.score}
          </li>
        ))}
      </ol>
    </div>
  );
}

import React from "react";
import { getT5Overview } from "../../../../lib/services/phasmoTourney5";
import Link from "next/link";

export default async function Page() {
  const overview = await getT5Overview();
  return (
    <div>
      <h2>Overview</h2>
      <p>Current Round: {overview.currentRoundNumber}</p>
      <p>Now: {overview.nowText}</p>
      <p>Next: {overview.nextText}</p>
      <p>Remaining Players: {overview.remainingPlayersCount}</p>
      <div>
        <h3>Quick Links</h3>
        <ul>
          <li>
            <Link href="/phasmotourney-series/phasmotourney5/players">
              Players
            </Link>
          </li>
          <li>
            <Link href="/phasmotourney-series/phasmotourney5/rounds">
              Rounds
            </Link>
          </li>
          <li>
            <Link href="/phasmotourney-series/phasmotourney5/leaderboard">
              Leaderboard
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

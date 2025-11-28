import Link from "next/link";
import React from "react";

export default function Tourney5SubNav() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/phasmotourney-series/phasmotourney5">Home</Link>
        </li>
        <li>
          <Link href="/phasmotourney-series/phasmotourney5/players">
            Players
          </Link>
        </li>
        <li>
          <Link href="/phasmotourney-series/phasmotourney5/rounds">Rounds</Link>
        </li>
        <li>
          <Link href="/phasmotourney-series/phasmotourney5/leaderboard">
            Leaderboard
          </Link>
        </li>
        <li>
          <Link href="/phasmotourney-series/phasmotourney5/player">Player</Link>
        </li>
      </ul>
    </nav>
  );
}

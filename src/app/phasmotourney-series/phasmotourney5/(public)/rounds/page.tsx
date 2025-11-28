import React from "react";
import Link from "next/link";
import { getT5Rounds } from "../../../../../lib/services/phasmoTourney5";

export default async function RoundsPage() {
  const rounds = await getT5Rounds();
  return (
    <div>
      <h2>Rounds</h2>
      <ul>
        {rounds.map((r) => (
          <li key={r.roundNumber}>
            <Link
              href={`/phasmotourney-series/phasmotourney5/rounds/${r.roundNumber}`}
            >
              {r.roundNumber}: {r.name} — {r.status}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

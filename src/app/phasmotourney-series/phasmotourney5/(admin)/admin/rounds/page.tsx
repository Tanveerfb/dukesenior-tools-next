import React from "react";
import Link from "next/link";
import { T5_ROUNDS } from "../../../../../../lib/services/phasmoTourney5";

export default function AdminRounds() {
  return (
    <div>
      <h3>Manage Rounds</h3>
      <ul>
        {T5_ROUNDS.map((r) => (
          <li key={r.roundNumber}>
            <Link
              href={`/phasmotourney-series/phasmotourney5/admin/rounds/${r.roundNumber}`}
            >
              Round {r.roundNumber}: {r.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

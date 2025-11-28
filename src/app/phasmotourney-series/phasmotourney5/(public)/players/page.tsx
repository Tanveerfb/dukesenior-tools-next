import React from "react";
import { getT5Players } from "../../../../../lib/services/phasmoTourney5";

export default async function PlayersPage() {
  const players = await getT5Players();
  return (
    <div>
      <h2>Players</h2>
      <ul>
        {players.map((p) => (
          <li key={p.id}>
            {p.displayName} — {p.status} — immunities:{" "}
            {p.immunities?.length ?? 0}
          </li>
        ))}
      </ul>
    </div>
  );
}

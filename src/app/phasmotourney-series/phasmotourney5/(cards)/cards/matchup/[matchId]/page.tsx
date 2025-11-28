import React from "react";
import { getT5MatchupCard } from "../../../../../../../lib/services/phasmoTourney5";

export default async function MatchupCard({
  params,
}: {
  params: { matchId: string };
}) {
  const card = await getT5MatchupCard(params.matchId);
  return (
    <div>
      <h4>
        Round {card.roundNumber} — {card.title}
      </h4>
      <div>
        <strong>{card.leftPlayer.name}</strong> vs{" "}
        <strong>{card.rightPlayer.name}</strong>
      </div>
      <div>{card.subtitle}</div>
    </div>
  );
}

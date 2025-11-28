import React from "react";
import {
  getT5OverlayState,
  getT5MatchupCard,
} from "../../../../../../lib/services/phasmoTourney5";

export const revalidate = 0;

export default async function MatchupOverlay() {
  const s = await getT5OverlayState();
  const card = await getT5MatchupCard(s.featuredMatchupId);
  return (
    <div>
      <h3>Round {card.roundNumber}</h3>
      <h4>{card.title}</h4>
      <div>
        {card.leftPlayer.name} vs {card.rightPlayer.name}
      </div>
      <div>{card.subtitle}</div>
    </div>
  );
}

import React from "react";
import { getT5RoundDetail } from "../../../../../../lib/services/phasmoTourney5";

interface Props {
  params: { roundNumber: string };
}

export default async function RoundDetail({ params }: Props) {
  const num = parseInt(params.roundNumber, 10) || 1;
  const detail = await getT5RoundDetail(num);
  return (
    <div>
      <h2>
        Round {detail.roundNumber}: {detail.name}
      </h2>
      <p>{detail.rulesText}</p>
      <section>
        <h3>Standings / Results</h3>
        <p>Placeholder for standings</p>
      </section>
      <section>
        <h3>Eliminations</h3>
        <p>Placeholder for eliminations</p>
      </section>
      <section>
        <h3>Immunities</h3>
        <p>Placeholder for immunities</p>
      </section>
    </div>
  );
}

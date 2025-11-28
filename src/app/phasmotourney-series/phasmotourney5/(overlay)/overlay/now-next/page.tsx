import React from "react";
import { getT5OverlayState } from "../../../../../../lib/services/phasmoTourney5";

export const revalidate = 0;

export default async function NowNext() {
  const s = await getT5OverlayState();
  return (
    <div>
      <div>{s.nowText}</div>
      <div>{s.nextText}</div>
    </div>
  );
}

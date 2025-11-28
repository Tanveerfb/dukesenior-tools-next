"use client";

import React, { useState } from "react";

export default function AdminRoundDetail({
  params,
}: {
  params: { roundNumber: string };
}) {
  const [status, setStatus] = useState<"upcoming" | "live" | "completed">(
    "upcoming"
  );
  return (
    <div>
      <h3>Admin Round {params.roundNumber}</h3>
      <label>
        Status:{" "}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="upcoming">upcoming</option>
          <option value="live">live</option>
          <option value="completed">completed</option>
        </select>
      </label>
      <section>
        <h4>Scores (placeholder)</h4>
        <p>TODO</p>
      </section>
      <section>
        <h4>Eliminations / Immunities (placeholder)</h4>
        <p>TODO</p>
      </section>
      <button disabled>Finalize round (disabled)</button>
    </div>
  );
}

"use client";

import React, { useState } from "react";

export default function VoteConfig({
  params,
}: {
  params: { voteSlug: string };
}) {
  const [open, setOpen] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  const link = `/phasmotourney-series/phasmotourney5/vote/${params.voteSlug}`;
  return (
    <div>
      <h3>Vote Session: {params.voteSlug}</h3>
      <label>
        Open:{" "}
        <input type="checkbox" checked={open} onChange={() => setOpen(!open)} />
      </label>
      <br />
      <label>
        Anonymous:{" "}
        <input
          type="checkbox"
          checked={anonymous}
          onChange={() => setAnonymous(!anonymous)}
        />
      </label>
      <section>
        <h4>Eligible voters</h4>
        <p>Placeholder</p>
      </section>
      <section>
        <h4>Shareable Link</h4>
        <p>{link}</p>
      </section>
      <section>
        <h4>Results</h4>
        <p>Placeholder</p>
      </section>
    </div>
  );
}

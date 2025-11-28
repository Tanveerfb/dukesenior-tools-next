"use client";

import React, { useState, useEffect } from "react";

export default function AdminOverlays() {
  const [nowText, setNowText] = useState("Now: TBD");
  const [nextText, setNextText] = useState("Next: TBD");
  const [featured, setFeatured] = useState("match-demo");
  useEffect(() => {}, []);
  return (
    <div>
      <h3>Overlay Controls</h3>
      <label>
        Now:{" "}
        <input value={nowText} onChange={(e) => setNowText(e.target.value)} />
      </label>
      <br />
      <label>
        Next:{" "}
        <input value={nextText} onChange={(e) => setNextText(e.target.value)} />
      </label>
      <br />
      <label>
        Featured Matchup:{" "}
        <select value={featured} onChange={(e) => setFeatured(e.target.value)}>
          <option value="match-demo">match-demo</option>
        </select>
      </label>
      <p>TODO: persist to Firestore for overlay routes</p>
    </div>
  );
}

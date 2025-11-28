"use client";

import React, { useState } from "react";
import { useAuth } from "../../../../../hooks/useAuth";

export default function PlayerDashboard() {
  const { user, loading } = useAuth();
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [note, setNote] = useState<string>("");

  if (loading) return <div>Loading...</div>;
  if (!user)
    return (
      <div>
        Login required. <a href="/login">Login</a>
      </div>
    );

  const startISO = start ? new Date(start).toISOString() : "";
  const endISO = end ? new Date(end).toISOString() : "";

  return (
    <div>
      <h2>Player Dashboard</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          Start:
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <br />
        <label>
          End:
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        <br />
        <label>
          Note:
          <input value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <br />
        <button disabled>Save (TODO)</button>
      </form>
      <div>
        <h3>Preview (UTC)</h3>
        <p>Start: {startISO}</p>
        <p>End: {endISO}</p>
        <p>Note: {note}</p>
      </div>
    </div>
  );
}

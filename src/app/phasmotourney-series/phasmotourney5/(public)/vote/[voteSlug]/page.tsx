"use client";

import React from "react";
import { useAuth } from "../../../../../../hooks/useAuth";

export default function VotePage({ params }: { params: { voteSlug: string } }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user)
    return (
      <div>
        Login required to vote. <a href="/login">Login</a>
      </div>
    );

  return (
    <div>
      <h2>Vote: {params.voteSlug}</h2>
      <p>Mock options:</p>
      <ul>
        <li>
          <label>
            <input type="radio" name="opt" disabled /> Option A
          </label>
        </li>
        <li>
          <label>
            <input type="radio" name="opt" disabled /> Option B
          </label>
        </li>
      </ul>
      <button disabled>Submit (disabled in skeleton)</button>
      <p>TODO: enforce Tourney 5 player-only votes and one vote per session</p>
    </div>
  );
}

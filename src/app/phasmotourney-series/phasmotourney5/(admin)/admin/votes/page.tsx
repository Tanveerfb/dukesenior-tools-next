import React from "react";
import Link from "next/link";

export default function AdminVotes() {
  const mock = ["vote-alpha", "vote-beta"];
  return (
    <div>
      <h3>Vote Sessions</h3>
      <ul>
        {mock.map((s) => (
          <li key={s}>
            <Link
              href={`/phasmotourney-series/phasmotourney5/admin/votes/${s}`}
            >
              {s}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

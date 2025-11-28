import Link from "next/link";
import React from "react";

export default function Tourney5AdminNav() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/phasmotourney-series/phasmotourney5/admin">
            Admin Home
          </Link>
        </li>
        <li>
          <Link href="/phasmotourney-series/phasmotourney5/admin/players">
            Players
          </Link>
        </li>
        <li>
          <Link href="/phasmotourney-series/phasmotourney5/admin/rounds">
            Rounds
          </Link>
        </li>
        <li>
          <Link href="/phasmotourney-series/phasmotourney5/admin/votes">
            Votes
          </Link>
        </li>
        <li>
          <Link href="/phasmotourney-series/phasmotourney5/admin/overlays">
            Overlays
          </Link>
        </li>
        <li>
          <Link href="/phasmotourney-series/phasmotourney5/admin/audit">
            Audit
          </Link>
        </li>
      </ul>
    </nav>
  );
}

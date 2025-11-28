import React from "react";
import Link from "next/link";
import { getT5Overview } from "../../../../../lib/services/phasmoTourney5";

export default async function AdminHome() {
  const overview = await getT5Overview();
  return (
    <div>
      <h3>Admin Dashboard</h3>
      <p>Now: {overview.nowText}</p>
      <ul>
        <li>
          <Link href="/phasmotourney-series/phasmotourney5/admin/players">
            Manage Players
          </Link>
        </li>
        <li>
          <Link href="/phasmotourney-series/phasmotourney5/admin/rounds">
            Manage Rounds
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
    </div>
  );
}

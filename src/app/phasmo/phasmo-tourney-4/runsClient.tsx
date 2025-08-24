"use client";
import { useEffect, useState } from "react";
import { NormalizedRun } from "@/types/tournament";
import { fetchTourney4Runs } from "../../../lib/firebase/legacy/phasmoT4Adapter"; // optional refetch

export default function RunsClient({
  initialRuns,
}: {
  initialRuns: NormalizedRun[];
}) {
  const [runs, setRuns] = useState(initialRuns);

  // Future: add Firestore live listener here

  return (
    <div className="table-responsive">
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Player</th>
            <th>Marks</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id}>
              <td>{r.playerOrTeam}</td>
              <td>{r.marks}</td>
              <td>{r.submittedAt.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";
import { useState } from "react";
import RecordedRunsTable from "@/components/tourney/RecordedRunsTable";
import RoundSelector from "@/components/tourney/RoundSelector";

export default function Tourney5RecordedRunDetailsPage() {
  const [selectedRound, setSelectedRound] = useState("round1");

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-lg font-semibold mb-3">
        Phasmo Tourney 5 — Recorded Run Details
      </h1>
      <RoundSelector
        selectedRound={selectedRound}
        onRoundChange={setSelectedRound}
      />
      <RecordedRunsTable roundId={selectedRound} showAdminControls={false} />
    </div>
  );
}

"use client";
import { useState } from "react";
import { Container } from "react-bootstrap";
import RecordedRunsTable from "@/components/tourney/RecordedRunsTable";
import RoundSelector from "@/components/tourney/RoundSelector";

export default function Tourney5RecordedRunDetailsPage() {
  const [selectedRound, setSelectedRound] = useState("round1");

  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-3">
        Phasmo Tourney 5 — Recorded Run Details
      </h1>
      <RoundSelector
        selectedRound={selectedRound}
        onRoundChange={setSelectedRound}
      />
      <RecordedRunsTable roundId={selectedRound} showAdminControls={false} />
    </Container>
  );
}

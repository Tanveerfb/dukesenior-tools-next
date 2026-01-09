"use client";
import { Container, Alert } from "react-bootstrap";
import RoundSettingsViewer from "../../../../components/tourney/RoundSettingsViewer";

export default function Tourney5RulesSettingsPage() {
  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-3">
        Phasmo Tourney 5 — Rules & Settings
      </h1>
      <Alert variant="info">Rules TBD. Game settings per round below.</Alert>
      <RoundSettingsViewer initialRoundId="round1" />
    </Container>
  );
}

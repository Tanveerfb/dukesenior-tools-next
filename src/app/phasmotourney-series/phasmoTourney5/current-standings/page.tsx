"use client";
import { useState } from "react";
import { Container, Alert, Button, Modal, Table } from "react-bootstrap";
import RoundSettingsViewer from "../../../../components/tourney/RoundSettingsViewer";

export default function Tourney5CurrentStandingsPage() {
  const [showR1, setShowR1] = useState(false);
  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-3">
        Phasmo Tourney 5 — Current Standings
      </h1>
      <Alert variant="info">TODO: Display current standings.</Alert>
      <RoundSettingsViewer initialRoundId="round1" />
      <div className="d-flex justify-content-end mb-3">
        <Button variant="outline-primary" onClick={() => setShowR1(true)}>
          Show Round 1 Results
        </Button>
      </div>

      <Modal show={showR1} onHide={() => setShowR1(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Round 1 Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="secondary" className="mb-3">
            TODO: Display Round 1 standings in descending order by score.
          </Alert>
          <Table responsive size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="text-muted">
                  TODO: Populate from Round 1 runs data.
                </td>
              </tr>
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

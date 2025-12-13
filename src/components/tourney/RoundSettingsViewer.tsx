"use client";
import React, { useState } from "react";
import { Card, Form } from "react-bootstrap";
import GameSettingsCard from "./GameSettingsCard";

const ROUND_IDS = [
  "round1",
  "round2",
  "round3",
  "round4",
  "round5",
  "round6",
  "round7",
] as const;

type Props = {
  initialRoundId?: (typeof ROUND_IDS)[number];
};

export default function RoundSettingsViewer({ initialRoundId = "round1" }: Props) {
  const [roundId, setRoundId] = useState<(typeof ROUND_IDS)[number]>(initialRoundId);
  return (
    <Card className="mb-3">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <strong>Game Settings</strong>
        <Form.Select
          value={roundId}
          onChange={(e) => setRoundId(e.target.value as (typeof ROUND_IDS)[number])}
          style={{ maxWidth: 180 }}
        >
          {ROUND_IDS.map((r) => (
            <option key={r} value={r}>
              {r.toUpperCase()}
            </option>
          ))}
        </Form.Select>
      </Card.Header>
      <Card.Body>
        <GameSettingsCard roundId={roundId} />
      </Card.Body>
    </Card>
  );
}

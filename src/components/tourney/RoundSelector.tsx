"use client";
import { ButtonGroup, Button } from "react-bootstrap";

interface Props {
  selectedRound: string;
  onRoundChange: (roundId: string) => void;
  availableRounds?: string[];
}

export default function RoundSelector({
  selectedRound,
  onRoundChange,
  availableRounds = ["round1", "round5", "round7"],
}: Props) {
  const roundLabels: Record<string, string> = {
    round1: "Round 1",
    round5: "Round 5",
    round7: "Round 7",
  };

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">Select Round</label>
      <div>
        <ButtonGroup>
          {availableRounds.map((roundId) => (
            <Button
              key={roundId}
              variant={
                selectedRound === roundId ? "primary" : "outline-primary"
              }
              onClick={() => onRoundChange(roundId)}
            >
              {roundLabels[roundId] || roundId}
            </Button>
          ))}
        </ButtonGroup>
      </div>
    </div>
  );
}

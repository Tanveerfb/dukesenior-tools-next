"use client";
import { cn } from "@/lib/utils";

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
      <label className="block text-sm font-semibold text-foreground mb-1">
        Select Round
      </label>
      <div className="inline-flex">
        {availableRounds.map((roundId, idx) => (
          <button
            key={roundId}
            type="button"
            onClick={() => onRoundChange(roundId)}
            className={cn(
              "px-4 py-2 text-sm font-medium border transition-colors",
              idx === 0 && "rounded-l-lg",
              idx === availableRounds.length - 1 && "rounded-r-lg",
              idx > 0 && "-ml-px",
              selectedRound === roundId
                ? "bg-primary-500 text-white border-primary-500"
                : "border-primary-500 text-primary-500 bg-transparent hover:bg-primary-500/10",
            )}
          >
            {roundLabels[roundId] || roundId}
          </button>
        ))}
      </div>
    </div>
  );
}

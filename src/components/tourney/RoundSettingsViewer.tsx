"use client";
import React, { useState } from "react";
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

export default function RoundSettingsViewer({
  initialRoundId = "round1",
}: Props) {
  const [roundId, setRoundId] =
    useState<(typeof ROUND_IDS)[number]>(initialRoundId);
  return (
    <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-3">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark">
        <strong className="text-foreground">Game Settings</strong>
        <select
          value={roundId}
          onChange={(e) =>
            setRoundId(e.target.value as (typeof ROUND_IDS)[number])
          }
          className="max-w-[180px] rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {ROUND_IDS.map((r) => (
            <option key={r} value={r}>
              {r.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
      <div className="p-4">
        <GameSettingsCard roundId={roundId} />
      </div>
    </div>
  );
}

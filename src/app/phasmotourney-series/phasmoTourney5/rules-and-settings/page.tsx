"use client";
import RoundSettingsViewer from "../../../../components/tourney/RoundSettingsViewer";

export default function Tourney5RulesSettingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-lg font-semibold mb-3">
        Phasmo Tourney 5 — Rules & Settings
      </h1>
      <div className="rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 px-4 py-3 text-sm text-blue-800 dark:text-blue-300 mb-4">
        Rules TBD. Game settings per round below.
      </div>
      <RoundSettingsViewer initialRoundId="round1" />
    </div>
  );
}

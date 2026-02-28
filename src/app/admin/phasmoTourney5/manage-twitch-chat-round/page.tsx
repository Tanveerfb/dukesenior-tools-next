"use client";
import MatchSettingsEditor from "@/components/tourney/MatchSettingsEditor";
import TwitchPollResultsCard from "@/components/tourney/TwitchPollResultsCard";
import EliminatorCard from "@/components/tourney/EliminatorCard";

export default function ManageTwitchChatRoundPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold mb-3">
        Round 4 — Twitch Chat Round (Admin)
      </h1>

      {/* Assign per-match settings */}
      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold">Match Settings</h2>
          <MatchSettingsEditor matchNumber={1} />
          <MatchSettingsEditor matchNumber={2} />
          <MatchSettingsEditor matchNumber={3} />
        </div>
      </div>

      {/* Twitch poll results capture */}
      <TwitchPollResultsCard />

      {/* Eliminator variant with player count options 2/3/5 */}
      <section className="mt-4">
        <EliminatorCard playerCountOptions={[2, 3, 5]} />
      </section>
    </div>
  );
}

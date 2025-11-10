"use client";
import VotingResults from "@/components/features/voting/VotingResults";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

export default function VotingResultsPage() {
  // For now only Round 1 implemented.
  return (
    <TourneyPage
      title="Voting Results"
      subtitle="Round 1 challenger tallies for Phasmo Tourney 5."
      breadcrumbs={buildTourneyBreadcrumbs([
        {
          label: "Phasmo Tourney 5",
          href: "/phasmotourney-series/phasmotourney5",
        },
        { label: "Voting Results" },
      ])}
      badges={[{ label: "Phasmo Tourney 5" }, { label: "Voting" }]}
      actions={[
        {
          label: "Open sessions",
          href: "/phasmotourney-series/phasmotourney5/voting-sessions/1",
          variant: "outline-light",
        },
      ]}
      containerProps={{ className: "py-3" }}
    >
      <VotingResults round={1} />
    </TourneyPage>
  );
}

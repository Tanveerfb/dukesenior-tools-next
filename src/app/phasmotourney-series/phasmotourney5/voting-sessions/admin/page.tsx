"use client";
import { Alert } from "react-bootstrap";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

export default function VotingAdminPage() {
  return (
    <TourneyPage
      title="Voting Sessions – Admin"
      subtitle="Administrative tooling for Tourney 5 ballots will return soon."
      breadcrumbs={buildTourneyBreadcrumbs([
        {
          label: "Phasmo Tourney 5",
          href: "/phasmotourney-series/phasmotourney5",
        },
        { label: "Voting Admin" },
      ])}
      badges={[{ label: "Phasmo Tourney 5" }, { label: "Admin" }]}
      containerProps={{ className: "py-3" }}
    >
      <Alert variant="warning" className="small">
        Voting management is temporarily disabled while we overhaul this
        feature.
      </Alert>
    </TourneyPage>
  );
}

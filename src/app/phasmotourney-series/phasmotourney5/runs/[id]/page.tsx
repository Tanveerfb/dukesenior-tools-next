"use client";
import { useParams } from "next/navigation";
import { Alert } from "react-bootstrap";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

export default function Tourney5RunDetails() {
  const params = useParams<{ id: string }>();
  const runId = params?.id ?? "…";
  const breadcrumbs = buildTourneyBreadcrumbs([
    {
      label: "Phasmo Tourney 5",
      href: "/phasmotourney-series/phasmotourney5",
    },
    {
      label: "Recorded Runs",
      href: "/phasmotourney-series/phasmotourney5/runs",
    },
    { label: `Run ${runId}` },
  ]);
  return (
    <TourneyPage
      title={`Run ${runId}`}
      subtitle="Detailed stats for this submission will land here soon."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 5" }, { label: "Runs" }]}
      actions={[
        {
          label: "Back to runs",
          href: "/phasmotourney-series/phasmotourney5/runs",
          variant: "outline-light",
        },
      ]}
      containerProps={{ className: "py-3" }}
    >
      <Alert variant="warning" className="small">
        Details view not implemented yet for Tourney 5.
      </Alert>
    </TourneyPage>
  );
}

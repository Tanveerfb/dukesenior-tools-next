import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { Card, Stack } from "react-bootstrap";

export default function T1() {
  const breadcrumbs = buildTourneyBreadcrumbs([{ label: "Phasmo Tourney 1" }]);

  return (
    <TourneyPage
      title="Phasmo Tourney 1"
      subtitle="Catch the original brackets, submissions, and score sheets from our very first tournament."
      breadcrumbs={breadcrumbs}
      containerProps={{ className: "py-4" }}
    >
      <Card className="shadow-sm">
        <Card.Body>
          <Stack gap={2}>
            <p className="mb-0 text-muted">
              Relive the launch edition of Phasmo Tourney and explore the
              archived tools used by the crew.
            </p>
            <Card.Link
              as={InlineLink}
              href="/phasmotourney-series/phasmotourney1"
              className="fw-semibold"
            >
              Open tournament hub
            </Card.Link>
          </Stack>
        </Card.Body>
      </Card>
    </TourneyPage>
  );
}

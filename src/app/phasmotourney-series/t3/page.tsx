import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { Card, Stack } from "react-bootstrap";

export default function T3() {
  const breadcrumbs = buildTourneyBreadcrumbs([{ label: "Phasmo Tourney 3" }]);

  return (
    <TourneyPage
      title="Phasmo Tourney 3"
      subtitle="Trios, rivalries, and the first marathon broadcast. Dive back into the action."
      breadcrumbs={breadcrumbs}
      containerProps={{ className: "py-4" }}
    >
      <Card className="shadow-sm">
        <Card.Body>
          <Stack gap={2}>
            <p className="mb-0 text-muted">
              Browse the bracket breakdowns, player stats, and memorable runs
              from tournament #3.
            </p>
            <Card.Link
              as={InlineLink}
              href="/phasmotourney-series/phasmotourney3"
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

import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { Card, Stack } from "react-bootstrap";

export default function T4() {
  const breadcrumbs = buildTourneyBreadcrumbs([{ label: "Phasmo Tourney 4" }]);

  return (
    <TourneyPage
      title="Phasmo Tourney 4"
      subtitle="The season where playoffs went wild and legends were born."
      breadcrumbs={breadcrumbs}
      containerProps={{ className: "py-4" }}
    >
      <Card className="shadow-sm">
        <Card.Body>
          <Stack gap={2}>
            <p className="mb-0 text-muted">
              Jump into standings, match archives, and recorded runs for the
              fourth tournament.
            </p>
            <Card.Link
              as={InlineLink}
              href="/phasmotourney-series/phasmotourney4"
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

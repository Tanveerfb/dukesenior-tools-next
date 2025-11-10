import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { Card, Stack } from "react-bootstrap";

export default function T2() {
  const breadcrumbs = buildTourneyBreadcrumbs([{ label: "Phasmo Tourney 2" }]);

  return (
    <TourneyPage
      title="Phasmo Tourney 2"
      subtitle="The sequel brought tougher brackets and new storylines. Grab the highlights below."
      breadcrumbs={breadcrumbs}
      containerProps={{ className: "py-4" }}
    >
      <Card className="shadow-sm">
        <Card.Body>
          <Stack gap={2}>
            <p className="mb-0 text-muted">
              Review match archives, standings, and stat recaps from tournament
              #2.
            </p>
            <Card.Link
              as={InlineLink}
              href="/phasmotourney-series/phasmotourney2"
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

"use client";

import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Stack from "react-bootstrap/Stack";

const TOURNEY5_ITEMS = [
  {
    id: "timeline",
    title: "Tournament Timeline",
    href: "/phasmotourney-series/phasmoTourney5/timeline",
    blurb: "Round-by-round breakdown of eliminations, votes, challenges, and immunities.",
  },
  {
    id: "whats-next",
    title: "What's Next?",
    href: "/phasmotourney-series/phasmoTourney5/whats-next",
    blurb: "Upcoming round details, schedule, and immune players.",
  },
  {
    id: "recorded-runs",
    title: "Recorded Run Details",
    href: "/phasmotourney-series/phasmoTourney5/recorded-run-details",
    blurb: "Complete archive of all recorded runs with detailed scoring.",
  },
  {
    id: "eliminator",
    title: "Eliminator Sessions",
    href: "/phasmotourney-series/phasmoTourney5/eliminator-sessions-data",
    blurb: "Challenge outcomes between players across all rounds.",
  },
  {
    id: "vote-sessions",
    title: "Vote Sessions",
    href: "/phasmotourney-series/phasmoTourney5/vote-sessions-data",
    blurb: "Community voting results and player elimination tallies.",
  },
  {
    id: "videos",
    title: "Videos & Streams",
    href: "/phasmotourney-series/phasmoTourney5/videos-and-stream-links",
    blurb: "Watch highlights and stream recordings from the tournament.",
  },
  {
    id: "rules",
    title: "Rules & Settings",
    href: "/phasmotourney-series/phasmoTourney5/rules-and-settings",
    blurb: "Game settings and tournament rules for each round.",
  },
];

export default function PhasmoTourney5Index() {
  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney Series", href: "/phasmotourney-series" },
    { label: "Phasmo Tourney 5" },
  ]);

  return (
    <TourneyPage
      title="Phasmo Tourney 5"
      subtitle="Follow the ultimate survival challenge with eliminations, voting, and immunity battles."
      breadcrumbs={breadcrumbs}
      accent="primary"
      containerProps={{ className: "py-4" }}
    >
      <Row className="g-3">
        {TOURNEY5_ITEMS.map((item) => (
          <Col key={item.id} xs={12} sm={6} lg={4} xl={3}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column justify-content-between gap-3">
                <Stack gap={1}>
                  <Card.Title className="h5 mb-0">{item.title}</Card.Title>
                  <Card.Text className="text-muted small mb-0">
                    {item.blurb}
                  </Card.Text>
                </Stack>
                <div>
                  <Card.Link
                    as={InlineLink}
                    href={item.href}
                    className="fw-semibold"
                  >
                    View details
                  </Card.Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </TourneyPage>
  );
}

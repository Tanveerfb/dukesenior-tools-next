"use client";

import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Stack from "react-bootstrap/Stack";

const SERIES_ITEMS = [
  {
    id: "t5",
    title: "Phasmo Tourney 5",
    href: "/phasmotourney-series/phasmoTourney5",
    blurb:
      "Ultimate survival challenge with eliminations, voting, and immunity battles.",
  },
  {
    id: "t4",
    title: "Phasmo Tourney 4",
    href: "/phasmotourney-series/phasmotourney4",
    blurb:
      "Dual-bracket showdown featuring the playoff gauntlet and stat dashboards.",
  },
  {
    id: "t3",
    title: "Phasmo Tourney 3",
    href: "/phasmotourney-series/phasmotourney3",
    blurb:
      "Toughest duo battles yet, complete with recorded runs and standings.",
  },
  {
    id: "t2",
    title: "Phasmo Tourney 2",
    href: "/phasmotourney-series/phasmotourney2",
    blurb:
      "Expanded field, revamped scoring, and the return of crowd favourites.",
  },
  {
    id: "t1",
    title: "Phasmo Tourney 1",
    href: "/phasmotourney-series/phasmotourney1",
    blurb:
      "Where it all began—original bracket, tools, and community highlights.",
  },
];

export default function SeriesIndex() {
  const breadcrumbs = buildTourneyBreadcrumbs([]);

  return (
    <TourneyPage
      title="Phasmo Tourney Series"
      subtitle="Explore every bracket, stat sheet, and run archive from The Lair of Evil community events."
      breadcrumbs={breadcrumbs}
      accent="info"
      containerProps={{ className: "py-4" }}
    >
      <Row className="g-3">
        {SERIES_ITEMS.map((item) => (
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
                    View bracket
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

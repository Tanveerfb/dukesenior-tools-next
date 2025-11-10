"use client";
import { Alert, Card, Col, Row } from "react-bootstrap";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

export default function Tourney5StatsPage() {
  return (
    <TourneyPage
      title="Stats"
      subtitle="Placeholder metrics for Phasmo Tourney 5 until live data sync arrives."
      breadcrumbs={buildTourneyBreadcrumbs([
        {
          label: "Phasmo Tourney 5",
          href: "/phasmotourney-series/phasmotourney5",
        },
        { label: "Stats" },
      ])}
      badges={[{ label: "Phasmo Tourney 5" }, { label: "Stats" }]}
      containerProps={{ className: "py-3" }}
    >
      <Alert variant="info" className="small">
        Stats will populate once runs and results are recorded.
      </Alert>
      <Row className="g-2">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="fw-semibold">Top Average</div>
              <div className="text-muted small">—</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="fw-semibold">Best Streak</div>
              <div className="text-muted small">—</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="fw-semibold">Most Marks</div>
              <div className="text-muted small">—</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </TourneyPage>
  );
}

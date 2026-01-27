"use client";

import { Badge, Card, Col, Row } from "react-bootstrap";
import { FaTrophy, FaUsers, FaCalendar } from "react-icons/fa";
import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { TOURNAMENT_METADATA } from "@/lib/data/tournamentArchive";

export default function ArchivePage() {
  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Archive" },
  ]);

  return (
    <TourneyPage
      title="Tournament Archive"
      subtitle="Explore the complete history of The Lair of Evil's Phasmo Tourney series"
      breadcrumbs={breadcrumbs}
      accent="info"
      containerProps={{ className: "py-4" }}
    >
      <Row xs={1} md={2} lg={2} className="g-4">
        {TOURNAMENT_METADATA.map((tournament) => (
          <Col key={tournament.id}>
            <Card 
              className="h-100 shadow-sm tournament-card"
              style={{
                borderTop: `4px solid ${tournament.themeColor}`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <Card.Body className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Badge 
                        bg="secondary" 
                        style={{ 
                          backgroundColor: tournament.themeColor,
                          borderColor: tournament.themeColor 
                        }}
                      >
                        {tournament.shortTitle}
                      </Badge>
                      <Badge bg="success">{tournament.status}</Badge>
                    </div>
                    <Card.Title className="h4 mb-2">
                      {tournament.title}
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {tournament.format}
                    </Card.Subtitle>
                  </div>
                </div>

                <Card.Text className="text-muted small">
                  {tournament.description}
                </Card.Text>

                <div className="d-flex flex-wrap gap-3 text-muted small">
                  <div className="d-flex align-items-center gap-1">
                    <FaCalendar />
                    <span>{tournament.year}</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <FaUsers />
                    <span>{tournament.participants} participants</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <span>{tournament.totalMatches} matches</span>
                  </div>
                </div>

                {tournament.winner && (
                  <div className="d-flex align-items-center gap-2 p-2 bg-success bg-opacity-10 rounded">
                    <FaTrophy className="text-warning" />
                    <div>
                      <div className="small text-muted">Champion</div>
                      <div className="fw-semibold">{tournament.winner}</div>
                    </div>
                  </div>
                )}

                <div className="mt-auto">
                  <Card.Link
                    as={InlineLink}
                    href={`/phasmotourney-series/archive/${tournament.id}`}
                    className="fw-semibold"
                  >
                    View Details →
                  </Card.Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <style jsx global>{`
        .tournament-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </TourneyPage>
  );
}

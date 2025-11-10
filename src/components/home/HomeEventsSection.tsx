"use client";
import React, { useMemo } from "react";
import { Badge, Card, Col, Row } from "react-bootstrap";
import Link from "next/link";
import {
  getEventGroupsByStatus,
  normalizeRoutePath,
} from "@/components/home/eventGroups";

function formatRouteLabel(title: string): string {
  return title.replace(/Tourney \d+\s*/i, "").trim() || title;
}

const HomeEventsSection: React.FC = () => {
  const groups = useMemo(() => getEventGroupsByStatus("Current"), []);

  if (!groups.length) return null;

  return (
    <section className="mb-5" aria-labelledby="home-events-heading">
      <header className="d-flex flex-wrap gap-3 align-items-start justify-content-between mb-4">
        <div>
          <Badge bg="primary" className="text-uppercase small fw-semibold">
            Live Events
          </Badge>
          <h2 id="home-events-heading" className="h4 fw-semibold mt-2 mb-1">
            Phasmo Tourney Spotlight
          </h2>
          <p className="text-muted small mb-0">
            Track brackets, recorded runs, and stats as matches progress.
          </p>
        </div>
        <Link
          href="/phasmotourney-series"
          className="btn btn-outline-primary btn-sm"
        >
          Browse all events
        </Link>
      </header>

      <Row className="g-4">
        {groups.map(
          ({ eventTag, displayName, status, primaryRoute, extraRoutes }) => (
            <Col key={eventTag} xs={12} md={6} xl={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div>
                      <Card.Subtitle className="text-uppercase small text-muted mb-1">
                        {eventTag.replace("Phasmo", "Phasmo ")}
                      </Card.Subtitle>
                      <Card.Title as="h3" className="h5 mb-0">
                        {displayName}
                      </Card.Title>
                    </div>
                    <Badge
                      bg={status === "Current" ? "success" : "secondary"}
                      className="text-uppercase"
                    >
                      {status}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <div className="text-muted text-uppercase small mb-1">
                      Start with
                    </div>
                    <Link
                      href={normalizeRoutePath(primaryRoute.path)}
                      className="fw-semibold text-decoration-none"
                    >
                      {formatRouteLabel(primaryRoute.title)}
                    </Link>
                  </div>

                  {extraRoutes.length > 0 && (
                    <div className="small mb-4">
                      <div className="text-muted text-uppercase small mb-1">
                        Also explore
                      </div>
                      <ul className="list-unstyled mb-0">
                        {extraRoutes.slice(0, 4).map((route) => (
                          <li key={route.path} className="mb-1">
                            <Link
                              href={normalizeRoutePath(route.path)}
                              className="text-decoration-none"
                            >
                              {formatRouteLabel(route.title)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link
                    href={normalizeRoutePath(primaryRoute.path)}
                    className="btn btn-primary mt-auto"
                  >
                    Open {displayName}
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          )
        )}
      </Row>
    </section>
  );
};

export default HomeEventsSection;

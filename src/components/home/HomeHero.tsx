"use client";
import Link from "next/link";
import { Badge, Card, Col, Container, Row, Stack } from "react-bootstrap";
import {
  getEventGroupsByStatus,
  normalizeRoutePath,
} from "@/components/home/eventGroups";

const HomeHero = () => {
  const [activeEvent] = getEventGroupsByStatus("Current");
  const primaryCtaHref = activeEvent
    ? normalizeRoutePath(activeEvent.primaryRoute.path)
    : "/phasmotourney-series";

  return (
    <section className="bg-body-tertiary border-bottom">
      <Container className="py-5">
        <Row className="align-items-center gy-4">
          <Col lg={7}>
            <Badge bg="primary" className="text-uppercase small fw-semibold">
              Now Live
            </Badge>
            <h1 className="display-5 fw-bold mt-3 mb-3">Phasmo Tourney 5</h1>
            <p className="lead text-muted mb-4">
              Follow brackets, recorded runs, and stats for the latest Phasmo
              Tourney showdown. Catch DukeSenior live for match commentary and
              behind-the-scenes updates.
            </p>
            <Stack direction="horizontal" gap={3} className="flex-wrap">
              <Link href={primaryCtaHref} className="btn btn-primary px-4">
                View brackets & stats
              </Link>
              <a
                href="https://twitch.tv/DukeSenior"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-secondary"
              >
                Watch on Twitch
              </a>
            </Stack>
          </Col>

          <Col lg={5}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex flex-column">
                <Card.Subtitle className="text-uppercase small text-muted mb-2">
                  Featured event
                </Card.Subtitle>
                <Card.Title as="h2" className="h4 mb-2">
                  {activeEvent ? activeEvent.displayName : "Stay tuned"}
                </Card.Title>
                <Card.Text className="text-muted small">
                  {activeEvent
                    ? "Follow brackets, stats, and recorded runs without leaving the hub."
                    : "We&apos;ll spotlight the next tourney as soon as it goes live."}
                </Card.Text>

                {activeEvent && (
                  <div className="mt-2">
                    <div className="text-muted text-uppercase small mb-2">
                      In this tourney
                    </div>
                    <ul className="list-unstyled small mb-0">
                      <li>
                        <Link
                          href={normalizeRoutePath(
                            activeEvent.primaryRoute.path
                          )}
                          className="text-decoration-none fw-semibold"
                        >
                          {activeEvent.primaryRoute.title}
                        </Link>
                      </li>
                      {activeEvent.extraRoutes.slice(0, 2).map((route) => (
                        <li key={route.path} className="mt-1">
                          <Link
                            href={normalizeRoutePath(route.path)}
                            className="text-decoration-none"
                          >
                            {route.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Link href={primaryCtaHref} className="btn btn-primary mt-auto">
                  {activeEvent
                    ? `Open ${activeEvent.displayName}`
                    : "Browse events"}
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HomeHero;

"use client";
import Link from "next/link";
import { Badge, Card, Col, Container, Row, Stack } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  getEventGroupsByStatus,
  normalizeRoutePath,
} from "@/components/home/eventGroups";

const HomeHero = () => {
  const [activeEvent] = getEventGroupsByStatus("Current");

  // Only show hero when at least one current event exists
  if (!activeEvent) return null;

  const primaryHref = normalizeRoutePath(activeEvent.primaryRoute.path);
  const secondary = activeEvent.extraRoutes[0];

  // Resolve special quick links for Tourney 5 when current
  const tourney5Links: { title: string; href: string }[] = [];
  if (activeEvent && activeEvent.eventTag === "PhasmoTourney5") {
    // Map manifest entries to required quick links
    const linkMap: { tag: string; title: string }[] = [
      { tag: "Timeline", title: "Timeline" },
      { tag: "Next", title: "What's Next?" },
      { tag: "Videos", title: "Videos & Streams" },
      { tag: "Rules", title: "Rules & Settings" },
    ];
    linkMap.forEach(({ tag, title }) => {
      const route = activeEvent.routes.find((r) => r.tags.includes(tag));
      if (route) {
        tourney5Links.push({
          title,
          href: normalizeRoutePath(route.path),
        });
      }
    });
  }

  return (
    <section
      className="border-bottom"
      style={{
        background:
          "linear-gradient(135deg, var(--bs-body-bg) 0%, rgba(13,110,253,.08) 50%, var(--bs-body-bg) 100%)",
      }}
    >
      <Container className="py-5">
        <Row className="align-items-center gy-4">
          <Col lg={7}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge bg="primary" className="text-uppercase small fw-semibold">
                Now Live
              </Badge>
            </motion.div>
            <Card className="border-0 mt-3 bg-transparent">
              <Card.Body className="p-0">
                <motion.h1
                  className="display-6 fw-semibold mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {activeEvent.displayName}
                </motion.h1>
                <motion.p
                  className="text-muted mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Brackets, recorded runs, settings, and streams — all in one
                  place.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Stack direction="horizontal" gap={3} className="flex-wrap">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href={primaryHref}
                        className="btn btn-primary px-4 py-2"
                      >
                        Open {activeEvent.displayName}
                      </Link>
                    </motion.div>
                    {secondary && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href={normalizeRoutePath(secondary.path)}
                          className="btn btn-outline-secondary"
                        >
                          {secondary.title}
                        </Link>
                      </motion.div>
                    )}
                  </Stack>
                </motion.div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={5}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex flex-column">
                  <Card.Subtitle className="text-uppercase small text-muted mb-2">
                    Quick links
                  </Card.Subtitle>
                  {tourney5Links.length > 0 ? (
                    <Stack gap={2} className="mb-3">
                      {tourney5Links.map((l, idx) => (
                        <motion.div
                          key={l.href}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                          whileHover={{ x: 4 }}
                        >
                          <Link
                            href={l.href}
                            className="btn btn-light text-start"
                          >
                            {l.title}
                          </Link>
                        </motion.div>
                      ))}
                    </Stack>
                  ) : (
                    <ul className="list-unstyled small mb-4">
                      <li className="mb-1">
                        <Link
                          href={primaryHref}
                          className="text-decoration-none fw-semibold"
                        >
                          {activeEvent.primaryRoute.title}
                        </Link>
                      </li>
                      {activeEvent.extraRoutes.slice(0, 2).map((route) => (
                        <li key={route.path} className="mb-1">
                          <Link
                            href={normalizeRoutePath(route.path)}
                            className="text-decoration-none"
                          >
                            {route.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <a
                      href="https://twitch.tv/DukeSenior"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-secondary mt-auto"
                    >
                      Watch on Twitch
                    </a>
                  </motion.div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};
export default HomeHero;

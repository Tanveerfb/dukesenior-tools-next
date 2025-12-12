"use client";
import Link from "next/link";
import { Card, ListGroup, Stack } from "react-bootstrap";
import { FaDiscord } from "react-icons/fa";
import { HiOutlineArrowNarrowRight } from "react-icons/hi";

const quickLinks = [
  {
    title: "Event hub",
    href: "/phasmotourney-series",
    description:
      "Browse brackets, stats, and match history across every tourney.",
  },
  {
    title: "Notifications",
    href: "/notifications",
    description: "Catch up on match-day announcements and automated updates.",
  },
  {
    title: "Community suggestions",
    href: "/suggestions",
    description: "Share ideas, report issues, and vote on what ships next.",
  },
];

const HomeSidebar = () => {
  return (
    <Stack gap={4}>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Card.Title as="h3" className="h5 fw-semibold mb-2">
            Stay connected
          </Card.Title>
          <Card.Text className="text-muted small mb-3">
            Coordinate with staff, players, and community members across the
            DukeSenior network.
          </Card.Text>
          <Stack gap={2}>
            <a
              href="https://discord.gg/xB9mpZfbq3"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
            >
              <FaDiscord /> The Lair of Evil
            </a>
            <a
              href="https://discord.gg/r9WT8RUPxn"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
            >
              <FaDiscord /> Phasmo Tourney
            </a>
          </Stack>
        </Card.Body>
      </Card>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Card.Title as="h3" className="h5 fw-semibold mb-2">
            Quick links
          </Card.Title>
          <Card.Text className="text-muted small mb-3">
            Jump straight to the tools that keep events running smoothly.
          </Card.Text>
          <ListGroup variant="flush" className="small">
            {quickLinks.map((link) => (
              <ListGroup.Item
                key={link.href}
                className="px-0 border-0 py-2 d-flex align-items-start justify-content-between gap-3"
              >
                <div>
                  <Link
                    href={link.href}
                    className="fw-semibold text-decoration-none d-block"
                  >
                    {link.title}
                  </Link>
                  <span className="text-muted">{link.description}</span>
                </div>
                <HiOutlineArrowNarrowRight className="text-muted flex-shrink-0" />
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </Stack>
  );
};

export default HomeSidebar;

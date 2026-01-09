"use client";
import Link from "next/link";
import { Card, ListGroup, Stack } from "react-bootstrap";
import { motion } from "framer-motion";
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
    title: "Community suggestions",
    href: "/suggestions",
    description: "Share ideas, report issues, and vote on what ships next.",
  },
];

const HomeSidebar = () => {
  return (
    <Stack gap={4}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
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
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <a
                  href="https://discord.gg/xB9mpZfbq3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                >
                  <FaDiscord /> The Lair of Evil
                </a>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <a
                  href="https://discord.gg/r9WT8RUPxn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                >
                  <FaDiscord /> Phasmo Tourney
                </a>
              </motion.div>
            </Stack>
          </Card.Body>
        </Card>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <Card.Title as="h3" className="h5 fw-semibold mb-2">
              Quick links
            </Card.Title>
            <Card.Text className="text-muted small mb-3">
              Jump straight to the tools that keep events running smoothly.
            </Card.Text>
            <ListGroup variant="flush" className="small">
              {quickLinks.map((link, idx) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <ListGroup.Item className="px-0 border-0 py-2 d-flex align-items-start justify-content-between gap-3">
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
                </motion.div>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </motion.div>
    </Stack>
  );
};

export default HomeSidebar;

import Link from "next/link";
import { Col, Container, Row, Stack } from "react-bootstrap";
import { FaDiscord, FaInstagram, FaTwitter } from "react-icons/fa";
import { RiNextjsFill } from "react-icons/ri";
import { BsFillBootstrapFill } from "react-icons/bs";
import { SiKofi } from "react-icons/si";

const navSections = [
  {
    title: "Explore",
    links: [
      { label: "Phasmo Tourney series", href: "/phasmotourney-series" },
      { label: "Posts & updates", href: "/posts" },
      { label: "Notifications", href: "/notifications" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "To-Do board", href: "/todolist" },
      { label: "Suggestions", href: "/suggestions" },
      { label: "Style check", href: "/style-check" },
    ],
  },
  {
    title: "Community",
    links: [
      {
        label: "The Lair of Evil Discord",
        href: "https://discord.gg/xB9mpZfbq3",
        external: true,
      },
      {
        label: "Phasmo Tourney Discord",
        href: "https://discord.gg/r9WT8RUPxn",
        external: true,
      },
      { label: "Profile", href: "/profile" },
    ],
  },
];

const socialLinks = [
  {
    icon: <FaTwitter />,
    label: "Twitter",
    href: "https://twitter.com/dukesenior",
  },
  {
    icon: <FaInstagram />,
    label: "Instagram",
    href: "https://www.instagram.com/dukesenior22",
  },
  {
    icon: <FaDiscord />,
    label: "Discord",
    href: "https://discord.gg/xB9mpZfbq3",
  },
];

export default function Footer() {
  return (
    <footer className="border-top bg-body-tertiary mt-auto">
      <Container className="py-5">
        <Row className="gy-5">
          <Col lg={4}>
            <h2 className="h4 fw-semibold mb-3">The Lair of Evil</h2>
            <p className="text-muted small mb-4">
              Tools, event dashboards, and community resources powering the
              Phasmo Tourney project and the DukeSenior community.
            </p>
            <Stack
              direction="horizontal"
              gap={3}
              className="flex-wrap align-items-center"
            >
              <a
                href="https://ko-fi.com/dukesenior"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-warning d-inline-flex align-items-center gap-2"
              >
                <SiKofi /> Support on Ko-Fi
              </a>
              <span className="text-muted small">
                &copy; {new Date().getFullYear()} DukeSenior
              </span>
            </Stack>
            <div className="text-muted small mt-3 d-flex align-items-center gap-3">
              <span className="d-inline-flex align-items-center gap-1">
                <RiNextjsFill /> Next.js
              </span>
              <span className="d-inline-flex align-items-center gap-1">
                <BsFillBootstrapFill /> React-Bootstrap
              </span>
            </div>
          </Col>

          {navSections.map((section) => (
            <Col key={section.title} xs={6} md={4} lg={2}>
              <h3 className="text-uppercase small text-muted fw-semibold mb-3">
                {section.title}
              </h3>
              <ul className="list-unstyled small mb-0">
                {section.links.map((link) => (
                  <li key={link.href} className="mb-2">
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none text-reset"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-decoration-none text-reset"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </Col>
          ))}
        </Row>

        <Row className="mt-5 pt-4 border-top">
          <Col md={6} className="text-muted small">
            Built with care for players, casters, and crew of the Phasmo
            Tourney.
          </Col>
          <Col md={6} className="mt-3 mt-md-0">
            <Stack
              direction="horizontal"
              gap={3}
              className="justify-content-md-end flex-wrap"
            >
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted d-inline-flex align-items-center gap-2"
                  aria-label={social.label}
                >
                  {social.icon}
                  <span className="small">{social.label}</span>
                </a>
              ))}
            </Stack>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

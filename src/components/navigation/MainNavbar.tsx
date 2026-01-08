"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Container,
  Nav,
  NavDropdown,
  Navbar,
  Spinner,
  Stack,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaChevronDown,
  FaFont,
  FaMoon,
  FaSearch,
  FaSun,
  FaTools,
  FaUserCircle,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import InlineLink from "@/components/ui/InlineLink";
import SearchModal from "@/components/navigation/SearchModal";
import type { EffectiveMeta as EffectiveMetaType } from "@/types/tags";
import { classifyEvents } from "@/lib/navigation/classify";
import { useAuth } from "@/hooks/useAuth";
import { getUserByUID } from "@/lib/services/users";
import { useTheme } from "@/components/ThemeProvider";

// Simple classification using tags; later can fetch /api for dynamic updates
type EffectiveMeta = EffectiveMetaType;

function mapHref(path: string) {
  return path.replace(/\[[^\]]+\]/g, "sample");
}

function formatRouteLabel(meta: EffectiveMeta) {
  if (/\/runs$/i.test(meta.path)) return "Runs";
  if (/standings/i.test(meta.path)) return "Standings";
  if (/recordedruns|records/i.test(meta.path)) return "Recorded Runs";
  if (/stats/i.test(meta.path)) return "Stats";
  if (/bracket/i.test(meta.title || "")) return "Bracket";
  if (/leaderboard/i.test(meta.title || "")) return "Leaderboard";
  return meta.title || meta.path;
}

function extractTournamentTag(meta: EffectiveMeta) {
  return meta.effective.find((tag) => /^PhasmoTourney\d+$/i.test(tag)) ?? null;
}

export default function MainNavbar() {
  const { user, logout, admin } = useAuth();
  const [profileHref, setProfileHref] = useState("/profile");
  const [showSearch, setShowSearch] = useState(false);
  const [effective, setEffective] = useState<EffectiveMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [navExpanded, setNavExpanded] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const {
    theme,
    toggleTheme,
    fontScale,
    increaseFont,
    decreaseFont,
    resetFont,
  } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const response = await fetch("/api/tags/effective");
        if (!response.ok) return;
        const data = (await response.json()) as EffectiveMeta[];
        if (!ignore) setEffective(data);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!user?.uid) {
      setProfileHref("/profile");
      return;
    }
    (async () => {
      try {
        const doc = await getUserByUID(user.uid);
        if (!cancelled && doc?.username) {
          setProfileHref(`/profile/${doc.username}`);
        } else if (!cancelled) {
          setProfileHref("/profile");
        }
      } catch {
        if (!cancelled) setProfileHref("/profile");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    setNavExpanded(false);
  }, [pathname]);

  const eventSections = useMemo(() => {
    const { currentGroups, pastGroups, currentKeys, pastKeys } =
      classifyEvents(effective);

    const buildSection = (
      keys: string[],
      groups: Record<string, EffectiveMeta[]>
    ) =>
      keys.map((key) => ({
        key,
        routes: [...groups[key]]
          .sort((a, b) => a.path.localeCompare(b.path))
          .map((meta) => ({
            meta,
            label: formatRouteLabel(meta),
            href: mapHref(meta.path),
            tourTag: extractTournamentTag(meta),
          })),
      }));

    return {
      current: buildSection(currentKeys, currentGroups),
      past: buildSection(pastKeys, pastGroups),
    };
  }, [effective]);

  useEffect(() => {
    setOpenSections((prev) => {
      const next: Record<string, boolean> = {};
      eventSections.current.forEach((section) => {
        const id = `current-${section.key}`;
        next[id] = prev[id] ?? true;
      });
      eventSections.past.forEach((section) => {
        const id = `past-${section.key}`;
        next[id] = prev[id] ?? false;
      });
      return next;
    });
  }, [eventSections]);

  const tools = useMemo(
    () =>
      effective
        .filter((meta) => meta.effective.includes("Tool"))
        .sort((a, b) => (a.title || a.path).localeCompare(b.title || b.path)),
    [effective]
  );

  const navbarStyle: React.CSSProperties =
    theme === "dark"
      ? {
          background:
            "linear-gradient(110deg, rgba(45,20,66,0.95), rgba(24,58,42,0.9))",
        }
      : {
          background:
            "linear-gradient(110deg, rgba(248,242,255,0.92), rgba(228,247,238,0.92))",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        };

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleNavItemClick = () => setNavExpanded(false);
  const openSearch = () => {
    setShowSearch(true);
    setNavExpanded(false);
  };
  const handleLogin = () => {
    setNavExpanded(false);
    router.push("/login");
  };
  const handleLogout = () => {
    logout();
    setNavExpanded(false);
  };

  const fontPercent = Math.round(fontScale * 100);

  return (
    <>
      <Navbar
        expand="lg"
        fixed="top"
        expanded={navExpanded}
        onToggle={(value) => setNavExpanded(Boolean(value))}
        className="shadow-sm border-0 enhanced-navbar"
        style={navbarStyle}
      >
        <Container fluid className="py-2 px-3">
          <Navbar.Brand
            as={InlineLink}
            href="/"
            className="fw-bold d-flex align-items-center gap-2"
            onClick={handleNavItemClick}
          >
            <HiOutlineSparkles size={24} />
            <span>The Lair of Evil</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-navbar" className="border-0" />

          <Navbar.Collapse id="main-navbar">
            <Nav className="me-auto align-items-lg-center gap-2 mt-3 mt-lg-0">{admin && (
                <NavDropdown
                  id="nav-admin"
                  title={
                    <span className="d-flex align-items-center gap-1">
                      <FaUserCircle />
                      <span className="d-none d-lg-inline">Admin</span>
                    </span>
                  }
                >
                  <NavDropdown.Header>General</NavDropdown.Header>
                  <NavDropdown.Item
                    as={InlineLink}
                    href="/admin/cms"
                    onClick={handleNavItemClick}
                  >
                    CMS Admin
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={InlineLink}
                    href="/admin/suggestions"
                    onClick={handleNavItemClick}
                  >
                    Suggestions
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Header>Phasmo Tourney 5</NavDropdown.Header>
                  <NavDropdown.Item
                    as={InlineLink}
                    href="/admin/phasmoTourney5/manageplayers"
                    onClick={handleNavItemClick}
                  >
                    Manage players
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={InlineLink}
                    href="/admin/phasmoTourney5/managevotesessions"
                    onClick={handleNavItemClick}
                  >
                    Manage vote sessions
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.ItemText className="px-3">
                    <button
                      type="button"
                      className="dropdown-section-toggle w-100 text-start"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setOpenSections((prev) => ({
                          ...prev,
                          adminManageRounds: !(prev.adminManageRounds ?? true),
                        }));
                      }}
                      aria-expanded={
                        openSections.adminManageRounds ?? true ? true : false
                      }
                    >
                      <span>Manage Rounds</span>
                      <FaChevronDown className="dropdown-section-toggle-icon" />
                    </button>
                  </NavDropdown.ItemText>
                  {(openSections.adminManageRounds ?? true) && (
                    <>
                      <NavDropdown.Item
                        as={InlineLink}
                        href="/admin/phasmoTourney5/managerounds/round1"
                        onClick={handleNavItemClick}
                      >
                        Round 1: Standard
                      </NavDropdown.Item>
                      <NavDropdown.Item
                        as={InlineLink}
                        href="/admin/phasmoTourney5/managerounds/round2"
                        onClick={handleNavItemClick}
                      >
                        Round 2: Money round
                      </NavDropdown.Item>
                      <NavDropdown.Item
                        as={InlineLink}
                        href="/admin/phasmoTourney5/managerounds/round3"
                        onClick={handleNavItemClick}
                      >
                        Round 3: Teams & Eliminator
                      </NavDropdown.Item>
                      <NavDropdown.Item
                        as={InlineLink}
                        href="/admin/phasmoTourney5/manage-twitch-chat-round"
                        onClick={handleNavItemClick}
                      >
                        Round 4: Twitch Chat Round
                      </NavDropdown.Item>
                      <NavDropdown.Item
                        as={InlineLink}
                        href="/admin/phasmoTourney5/managerounds/round5"
                        onClick={handleNavItemClick}
                      >
                        Round 5: Tourney 5 Special
                      </NavDropdown.Item>
                      <NavDropdown.Item
                        as={InlineLink}
                        href="/admin/phasmoTourney5/managerounds/round6"
                        onClick={handleNavItemClick}
                      >
                        Round 6: Pick Your Friend
                      </NavDropdown.Item>
                      <NavDropdown.Item
                        as={InlineLink}
                        href="/admin/phasmoTourney5/managerounds/round7"
                        onClick={handleNavItemClick}
                      >
                        Round 7: Finale
                      </NavDropdown.Item>
                    </>
                  )}
                </NavDropdown>
              )}

              <NavDropdown
                id="nav-events"
                title={
                  <span className="d-flex align-items-center gap-2">
                    <FaCalendarAlt />
                    <span>Events</span>
                  </span>
                }
                className="mobile-optimized-dropdown"
              >
                <NavDropdown.Header>Current Events</NavDropdown.Header>
                {loading && (
                  <NavDropdown.ItemText className="text-muted small px-3">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Loading events…
                  </NavDropdown.ItemText>
                )}
                {!loading && eventSections.current.length === 0 && (
                  <NavDropdown.ItemText className="text-muted small px-3">
                    No active events yet.
                  </NavDropdown.ItemText>
                )}
                {eventSections.current.map((section) => {
                  const sectionId = `current-${section.key}`;
                  const isOpen = openSections[sectionId] ?? true;
                  return (
                    <div key={sectionId} className="dropdown-section">
                      <button
                        type="button"
                        className="dropdown-section-toggle"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleSection(sectionId);
                        }}
                        aria-expanded={isOpen}
                      >
                        <span>{section.key}</span>
                        <FaChevronDown className="dropdown-section-toggle-icon" />
                      </button>
                      {isOpen && (
                        <div className="dropdown-section-items">
                          {section.routes.map(
                            ({ meta, label, href, tourTag }) => (
                              <NavDropdown.Item
                                as={InlineLink}
                                key={meta.path}
                                href={href}
                                onClick={handleNavItemClick}
                                className="d-flex justify-content-between align-items-center gap-2"
                              >
                                <span>{label}</span>
                                {tourTag && (
                                  <Badge bg="secondary" pill>
                                    {tourTag.replace("PhasmoTourney", "T")}
                                  </Badge>
                                )}
                              </NavDropdown.Item>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                <NavDropdown.Divider />
                <NavDropdown.Header>Past Events</NavDropdown.Header>
                {eventSections.past.length === 0 && (
                  <NavDropdown.ItemText className="text-muted small px-3">
                    No archived events yet.
                  </NavDropdown.ItemText>
                )}
                {eventSections.past.map((section) => {
                  const sectionId = `past-${section.key}`;
                  const isOpen = openSections[sectionId] ?? false;
                  return (
                    <div key={sectionId} className="dropdown-section">
                      <button
                        type="button"
                        className="dropdown-section-toggle"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleSection(sectionId);
                        }}
                        aria-expanded={isOpen}
                      >
                        <span>{section.key}</span>
                        <FaChevronDown className="dropdown-section-toggle-icon" />
                      </button>
                      {isOpen && (
                        <div className="dropdown-section-items">
                          {section.routes.map(
                            ({ meta, label, href, tourTag }) => (
                              <NavDropdown.Item
                                as={InlineLink}
                                key={meta.path}
                                href={href}
                                onClick={handleNavItemClick}
                                className="d-flex justify-content-between align-items-center gap-2"
                              >
                                <span>{label}</span>
                                {tourTag && (
                                  <Badge bg="secondary" pill>
                                    {tourTag.replace("PhasmoTourney", "T")}
                                  </Badge>
                                )}
                              </NavDropdown.Item>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </NavDropdown>

              <NavDropdown
                id="nav-tools"
                title={
                  <span className="d-flex align-items-center gap-2">
                    <FaTools />
                    <span>Tools</span>
                  </span>
                }
                className="mobile-optimized-dropdown"
              >
                <NavDropdown.Item
                  as={InlineLink}
                  href="/notifications"
                  onClick={handleNavItemClick}
                >
                  To-Do List
                </NavDropdown.Item>
                <NavDropdown.Divider />
                {tools.length === 0 && (
                  <NavDropdown.ItemText className="text-muted small px-3">
                    No tools available yet.
                  </NavDropdown.ItemText>
                )}
                {tools.map((meta) => {
                  const badges = meta.effective
                    .filter((tag) => ["AI", "ToDo"].includes(tag))
                    .slice(0, 2);
                  return (
                    <NavDropdown.Item
                      as={InlineLink}
                      href={mapHref(meta.path)}
                      key={meta.path}
                      onClick={handleNavItemClick}
                      className="d-flex justify-content-between align-items-center gap-2"
                    >
                      <span>{meta.title || meta.path}</span>
                      {badges.length > 0 && (
                        <span className="d-flex gap-1">
                          {badges.map((badge) => (
                            <Badge
                              key={badge}
                              bg="secondary"
                              className="text-uppercase"
                              style={{ fontSize: "0.6rem" }}
                            >
                              {badge}
                            </Badge>
                          ))}
                        </span>
                      )}
                    </NavDropdown.Item>
                  );
                })}
              </NavDropdown>

              <Nav.Link
                as={InlineLink}
                href="/posts"
                onClick={handleNavItemClick}
                className="nav-link-enhanced"
              >
                Community Updates
              </Nav.Link>
            </Nav>

            <Nav className="ms-auto align-items-lg-center gap-2 mt-3 mt-lg-0">
              <Button
                variant={
                  theme === "dark" ? "outline-light" : "outline-secondary"
                }
                className="d-flex align-items-center gap-2 w-100 w-lg-auto justify-content-center"
                onClick={openSearch}
              >
                <FaSearch />
                <span>Search</span>
              </Button>

              <NavDropdown
                id="nav-display"
                title={
                  <span className="d-flex align-items-center gap-2">
                    <FaFont />
                    <span>Display</span>
                  </span>
                }
                align="end"
                className="mobile-dropdown"
              >
                <NavDropdown.Header>Text size</NavDropdown.Header>
                <NavDropdown.ItemText className="text-muted small px-3">
                  Currently {fontPercent}%
                </NavDropdown.ItemText>
                <Stack direction="horizontal" gap={2} className="px-3 pb-3">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={decreaseFont}
                    aria-label="Decrease text size"
                    className="flex-fill"
                  >
                    A-
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={resetFont}
                    aria-label="Reset text size"
                    className="flex-fill"
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={increaseFont}
                    aria-label="Increase text size"
                    className="flex-fill"
                  >
                    A+
                  </Button>
                </Stack>
                <NavDropdown.Divider />
                <NavDropdown.Header>Theme</NavDropdown.Header>
                <NavDropdown.Item
                  as="button"
                  className="btn btn-outline-secondary mx-3 mb-2 d-flex align-items-center gap-2"
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? (
                    <>
                      <FaSun /> Light theme
                    </>
                  ) : (
                    <>
                      <FaMoon /> Dark theme
                    </>
                  )}
                </NavDropdown.Item>
              </NavDropdown>

              {user ? (
                <NavDropdown
                  id="nav-user"
                  align="end"
                  title={
                    <span className="d-flex align-items-center gap-2">
                      <FaUserCircle size={20} />
                      <span className="d-lg-none">
                        {user.displayName || user.email || "Profile"}
                      </span>
                    </span>
                  }
                  className="mobile-dropdown"
                >
                  <NavDropdown.Item
                    as={InlineLink}
                    href={profileHref}
                    onClick={handleNavItemClick}
                  >
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Button variant="primary" onClick={handleLogin} className="w-100 w-lg-auto">
                  Log in
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div style={{ height: "72px" }} />
      <SearchModal show={showSearch} onHide={() => setShowSearch(false)} />
    </>
  );
}

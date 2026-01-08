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
  FaChevronRight,
  FaFont,
  FaMoon,
  FaSearch,
  FaSun,
  FaUserCircle,
  FaShieldAlt,
  FaNewspaper,
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



  const navbarStyle: React.CSSProperties =
    theme === "dark"
      ? {
          background:
            "linear-gradient(135deg, rgba(30,20,50,0.98), rgba(20,35,35,0.96))",
          borderBottom: "1px solid rgba(171, 47, 177, 0.2)",
        }
      : {
          background:
            "linear-gradient(135deg, rgba(255,252,255,0.95), rgba(240,250,245,0.95))",
          borderBottom: "1px solid rgba(171, 47, 177, 0.15)",
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
        className="modern-navbar shadow-sm"
        style={navbarStyle}
      >
        <Container fluid className="navbar-container">
          {/* Brand Section */}
          <Navbar.Brand
            as={InlineLink}
            href="/"
            className="brand-link"
            onClick={handleNavItemClick}
          >
            <HiOutlineSparkles className="brand-icon" />
            <span className="brand-text">The Lair of Evil</span>
          </Navbar.Brand>

          {/* Desktop Action Buttons */}
          <div className="d-none d-lg-flex align-items-center gap-2 order-lg-3">
            <Button
              variant="link"
              className="icon-btn search-btn"
              onClick={openSearch}
              aria-label="Search"
            >
              <FaSearch />
            </Button>

            <Button
              variant="link"
              className="icon-btn theme-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${
                theme === "dark" ? "light" : "dark"
              } theme`}
            >
              {theme === "dark" ? <FaSun /> : <FaMoon />}
            </Button>

            {user ? (
              <NavDropdown
                id="nav-user-desktop"
                align="end"
                title={
                  <div className="user-avatar">
                    <FaUserCircle />
                  </div>
                }
                className="user-dropdown"
              >
                <div className="user-info">
                  <div className="user-name">{user.displayName || "User"}</div>
                  <div className="user-email">{user.email}</div>
                </div>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  as={InlineLink}
                  href={profileHref}
                  onClick={handleNavItemClick}
                >
                  <FaUserCircle className="me-2" />
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Button
                variant="primary"
                onClick={handleLogin}
                className="login-btn"
              >
                Log in
              </Button>
            )}
          </div>

          {/* Mobile Toggle */}
          <Navbar.Toggle aria-controls="main-navbar" className="border-0" />

          <Navbar.Collapse id="main-navbar">
            {/* Main Navigation */}
            <Nav className="navbar-nav-main">
              {/* Admin Dropdown - Only show if admin */}
              {admin && (
                <NavDropdown
                  id="nav-admin"
                  title={
                    <>
                      <FaShieldAlt className="nav-icon" />
                      <span>Admin</span>
                    </>
                  }
                  className="main-dropdown"
                >
                  <div className="dropdown-header-custom">General</div>
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
                  <div className="dropdown-header-custom">Phasmo Tourney 5</div>
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

                  {/* Collapsible Rounds Section */}
                  <div className="nested-section">
                    <button
                      type="button"
                      className="section-toggle"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenSections((prev) => ({
                          ...prev,
                          adminManageRounds: !(prev.adminManageRounds ?? true),
                        }));
                      }}
                      aria-expanded={openSections.adminManageRounds ?? true}
                    >
                      <span>Manage Rounds</span>
                      <FaChevronRight className="section-icon" />
                    </button>
                    {(openSections.adminManageRounds ?? true) && (
                      <div className="nested-items">
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
                      </div>
                    )}
                  </div>
                </NavDropdown>
              )}

              {/* Events Dropdown */}
              <NavDropdown
                id="nav-events"
                title={
                  <>
                    <FaCalendarAlt className="nav-icon" />
                    <span>Events</span>
                  </>
                }
                className="main-dropdown events-dropdown"
              >
                <div className="dropdown-header-custom">Current Events</div>
                {loading && (
                  <div className="dropdown-loading">
                    <Spinner animation="border" size="sm" />
                    <span>Loading events…</span>
                  </div>
                )}
                {!loading && eventSections.current.length === 0 && (
                  <div className="dropdown-empty">No active events yet.</div>
                )}
                {eventSections.current.map((section) => {
                  const sectionId = `current-${section.key}`;
                  const isOpen = openSections[sectionId] ?? true;
                  return (
                    <div key={sectionId} className="nested-section">
                      <button
                        type="button"
                        className="section-toggle"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSection(sectionId);
                        }}
                        aria-expanded={isOpen}
                      >
                        <span>{section.key}</span>
                        <FaChevronRight className="section-icon" />
                      </button>
                      {isOpen && (
                        <div className="nested-items">
                          {section.routes.map(
                            ({ meta, label, href, tourTag }) => (
                              <NavDropdown.Item
                                as={InlineLink}
                                key={meta.path}
                                href={href}
                                onClick={handleNavItemClick}
                              >
                                <span>{label}</span>
                                {tourTag && (
                                  <Badge bg="primary" pill className="ms-auto">
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
                <div className="dropdown-header-custom">Past Events</div>
                {eventSections.past.length === 0 && (
                  <div className="dropdown-empty">No archived events yet.</div>
                )}
                {eventSections.past.map((section) => {
                  const sectionId = `past-${section.key}`;
                  const isOpen = openSections[sectionId] ?? false;
                  return (
                    <div key={sectionId} className="nested-section">
                      <button
                        type="button"
                        className="section-toggle"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSection(sectionId);
                        }}
                        aria-expanded={isOpen}
                      >
                        <span>{section.key}</span>
                        <FaChevronRight className="section-icon" />
                      </button>
                      {isOpen && (
                        <div className="nested-items">
                          {section.routes.map(
                            ({ meta, label, href, tourTag }) => (
                              <NavDropdown.Item
                                as={InlineLink}
                                key={meta.path}
                                href={href}
                                onClick={handleNavItemClick}
                              >
                                <span>{label}</span>
                                {tourTag && (
                                  <Badge
                                    bg="secondary"
                                    pill
                                    className="ms-auto"
                                  >
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

              {/* Tools Dropdown */}
              <NavDropdown
                id="nav-tools"
                title={
                  <>
                    <FaTools className="nav-icon" />
                    <span>Tools</span>
                  </>
                }
                className="main-dropdown"
              >
                <NavDropdown.Item
                  as={InlineLink}
                  href="/notifications"
                  onClick={handleNavItemClick}
                >
                  To-Do List
                </NavDropdown.Item>
                {tools.length > 0 && <NavDropdown.Divider />}
                {tools.length === 0 && (
                  <div className="dropdown-empty">No tools available yet.</div>
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
                    >
                      <span>{meta.title || meta.path}</span>
                      {badges.length > 0 && (
                        <span className="ms-auto d-flex gap-1">
                          {badges.map((badge) => (
                            <Badge key={badge} bg="info" className="tool-badge">
                              {badge}
                            </Badge>
                          ))}
                        </span>
                      )}
                    </NavDropdown.Item>
                  );
                })}
              </NavDropdown>

              {/* Community Updates Link */}
              <Nav.Link
                as={InlineLink}
                href="/posts"
                onClick={handleNavItemClick}
                className="nav-link-main"
              >
                <FaNewspaper className="nav-icon" />
                <span>Community Updates</span>
              </Nav.Link>
            </Nav>

            {/* Mobile-only Section */}
            <div className="mobile-only-section">
              <div className="mobile-divider" />

              {/* Search Button - Mobile */}
              <Button
                variant="outline-primary"
                className="mobile-action-btn"
                onClick={openSearch}
              >
                <FaSearch className="me-2" />
                Search
              </Button>

              {/* Display Settings - Mobile */}
              <div className="mobile-settings">
                <div className="settings-label">Display Settings</div>

                {/* Theme Toggle */}
                <Button
                  variant="outline-secondary"
                  className="mobile-action-btn"
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? (
                    <>
                      <FaSun className="me-2" />
                      Light Theme
                    </>
                  ) : (
                    <>
                      <FaMoon className="me-2" />
                      Dark Theme
                    </>
                  )}
                </Button>

                {/* Font Size Controls */}
                <div className="font-controls">
                  <div className="font-label">
                    <FaFont className="me-2" />
                    Text Size: {fontPercent}%
                  </div>
                  <Stack direction="horizontal" gap={2}>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={decreaseFont}
                      className="flex-fill"
                    >
                      A-
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={resetFont}
                      className="flex-fill"
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={increaseFont}
                      className="flex-fill"
                    >
                      A+
                    </Button>
                  </Stack>
                </div>
              </div>

              {/* User Section - Mobile */}
              {user ? (
                <div className="mobile-user-section">
                  <div className="mobile-divider" />
                  <div className="user-info-mobile">
                    <FaUserCircle size={24} />
                    <div>
                      <div className="user-name">
                        {user.displayName || "User"}
                      </div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline-primary"
                    className="mobile-action-btn"
                    as={InlineLink}
                    href={profileHref}
                    onClick={handleNavItemClick}
                  >
                    <FaUserCircle className="me-2" />
                    View Profile
                  </Button>
                  <Button
                    variant="outline-danger"
                    className="mobile-action-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="mobile-user-section">
                  <div className="mobile-divider" />
                  <Button
                    variant="primary"
                    className="mobile-action-btn w-100"
                    onClick={handleLogin}
                  >
                    Log in
                  </Button>
                </div>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div className="navbar-spacer" />
      <SearchModal show={showSearch} onHide={() => setShowSearch(false)} />
    </>
  );
}

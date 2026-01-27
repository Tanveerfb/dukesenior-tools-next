"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Box,
  Container,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Collapse,
  Typography,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  AccountCircle as AccountCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AdminPanelSettings as AdminIcon,
  Event as EventIcon,
  Build as BuildIcon,
  Newspaper as NewspaperIcon,
  AutoAwesome as SparklesIcon,
  HelpOutline as HelpIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTheme as useCustomTheme } from "@/components/ThemeProvider";
import { getUserByUID } from "@/lib/services/users";
import type { EffectiveMeta as EffectiveMetaType } from "@/types/tags";
import { classifyEvents } from "@/lib/navigation/classify";
import SearchModal from "@/components/navigation/SearchModal";
import KeyboardShortcutsModal from "@/components/ui/KeyboardShortcutsModal";
import { useHotkeys } from "react-hotkeys-hook";

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

export default function AppNavbar() {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const { user, logout, admin } = useAuth();
  const { theme, toggleTheme } = useCustomTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [eventsAnchorEl, setEventsAnchorEl] = useState<null | HTMLElement>(null);
  const [toolsAnchorEl, setToolsAnchorEl] = useState<null | HTMLElement>(null);
  const [adminAnchorEl, setAdminAnchorEl] = useState<null | HTMLElement>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [profileHref, setProfileHref] = useState("/profile");
  const [effective, setEffective] = useState<EffectiveMeta[]>([]);
  const [_loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Keyboard shortcuts
  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    setShowSearch(true);
  });

  useHotkeys("mod+/", (e) => {
    e.preventDefault();
    toggleTheme();
  });

  useHotkeys("mod+shift+/", (e) => {
    e.preventDefault();
    setShowShortcuts(true);
  });

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
    setMobileOpen(false);
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

  const tools = useMemo(
    () =>
      effective
        .filter((meta) => meta.effective.includes("Tool"))
        .sort((a, b) => (a.title || a.path).localeCompare(b.title || b.path)),
    [effective]
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogin = () => {
    setMobileOpen(false);
    router.push("/login");
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    setUserAnchorEl(null);
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <SparklesIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          The Lair of Evil
        </Typography>
      </Box>
      <Divider />
      <List>
        {/* Admin Section */}
        {admin && (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => toggleSection("admin")}>
                <ListItemIcon>
                  <AdminIcon />
                </ListItemIcon>
                <ListItemText primary="Admin" />
                {openSections.admin ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
            </ListItem>
            <Collapse in={openSections.admin} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }} component={Link} href="/admin/cms">
                  <ListItemText primary="CMS Admin" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} component={Link} href="/admin/suggestions">
                  <ListItemText primary="Suggestions" />
                </ListItemButton>
              </List>
            </Collapse>
            <Divider />
          </>
        )}

        {/* Events Section */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => toggleSection("events")}>
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Events" />
            {openSections.events ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openSections.events} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {eventSections.current.map((section) => (
              <Box key={section.key}>
                <ListItemButton sx={{ pl: 4 }} onClick={() => toggleSection(`current-${section.key}`)}>
                  <ListItemText primary={section.key} />
                  {openSections[`current-${section.key}`] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
                <Collapse in={openSections[`current-${section.key}`]} timeout="auto" unmountOnExit>
                  {section.routes.map(({ meta, label, href }) => (
                    <ListItemButton key={meta.path} sx={{ pl: 6 }} component={Link} href={href}>
                      <ListItemText primary={label} />
                    </ListItemButton>
                  ))}
                </Collapse>
              </Box>
            ))}
          </List>
        </Collapse>

        {/* Tools Section */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => toggleSection("tools")}>
            <ListItemIcon>
              <BuildIcon />
            </ListItemIcon>
            <ListItemText primary="Tools" />
            {openSections.tools ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openSections.tools} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} component={Link} href="/notifications">
              <ListItemText primary="To-Do List" />
            </ListItemButton>
            {tools.map((meta) => (
              <ListItemButton key={meta.path} sx={{ pl: 4 }} component={Link} href={mapHref(meta.path)}>
                <ListItemText primary={meta.title || meta.path} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* Community Updates */}
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/posts">
            <ListItemIcon>
              <NewspaperIcon />
            </ListItemIcon>
            <ListItemText primary="Community Updates" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      {/* User Section */}
      <Box sx={{ p: 2 }}>
        {user ? (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                {user.displayName || "User"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="outlined"
              component={Link}
              href={profileHref}
              sx={{ mb: 1 }}
            >
              Profile
            </Button>
            <Button fullWidth variant="outlined" color="error" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button fullWidth variant="contained" onClick={handleLogin}>
            Log in
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile Menu Icon */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Brand */}
            <Box
              component={Link}
              href="/"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                textDecoration: "none",
                color: "inherit",
                flexGrow: isMobile ? 1 : 0,
              }}
            >
              <SparklesIcon color="primary" />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                The Lair of Evil
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: "flex", gap: 1, ml: 4 }}>
                {/* Admin Dropdown */}
                {admin && (
                  <>
                    <Button
                      color="inherit"
                      startIcon={<AdminIcon />}
                      onClick={(e) => setAdminAnchorEl(e.currentTarget)}
                    >
                      Admin
                    </Button>
                    <Menu
                      anchorEl={adminAnchorEl}
                      open={Boolean(adminAnchorEl)}
                      onClose={() => setAdminAnchorEl(null)}
                    >
                      <MenuItem component={Link} href="/admin/cms" onClick={() => setAdminAnchorEl(null)}>
                        CMS Admin
                      </MenuItem>
                      <MenuItem component={Link} href="/admin/suggestions" onClick={() => setAdminAnchorEl(null)}>
                        Suggestions
                      </MenuItem>
                    </Menu>
                  </>
                )}

                {/* Events Dropdown */}
                <Button
                  color="inherit"
                  startIcon={<EventIcon />}
                  onClick={(e) => setEventsAnchorEl(e.currentTarget)}
                >
                  Events
                </Button>
                <Menu
                  anchorEl={eventsAnchorEl}
                  open={Boolean(eventsAnchorEl)}
                  onClose={() => setEventsAnchorEl(null)}
                  PaperProps={{ sx: { maxHeight: 500, width: 300 } }}
                >
                  <MenuItem disabled>
                    <Typography variant="caption" fontWeight="bold">
                      CURRENT EVENTS
                    </Typography>
                  </MenuItem>
                  {eventSections.current.map((section) => (
                    <Box key={section.key}>
                      {section.routes.map(({ meta, label, href, tourTag }) => (
                        <MenuItem
                          key={meta.path}
                          component={Link}
                          href={href}
                          onClick={() => setEventsAnchorEl(null)}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                            <span>{label}</span>
                            {tourTag && (
                              <Chip
                                label={tourTag.replace("PhasmoTourney", "T")}
                                size="small"
                                color="primary"
                              />
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Box>
                  ))}
                </Menu>

                {/* Tools Dropdown */}
                <Button
                  color="inherit"
                  startIcon={<BuildIcon />}
                  onClick={(e) => setToolsAnchorEl(e.currentTarget)}
                >
                  Tools
                </Button>
                <Menu
                  anchorEl={toolsAnchorEl}
                  open={Boolean(toolsAnchorEl)}
                  onClose={() => setToolsAnchorEl(null)}
                >
                  <MenuItem component={Link} href="/notifications" onClick={() => setToolsAnchorEl(null)}>
                    To-Do List
                  </MenuItem>
                  {tools.map((meta) => (
                    <MenuItem
                      key={meta.path}
                      component={Link}
                      href={mapHref(meta.path)}
                      onClick={() => setToolsAnchorEl(null)}
                    >
                      {meta.title || meta.path}
                    </MenuItem>
                  ))}
                </Menu>

                {/* Community Updates */}
                <Button color="inherit" startIcon={<NewspaperIcon />} component={Link} href="/posts">
                  Community Updates
                </Button>
              </Box>
            )}

            {/* Right Side Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton color="inherit" onClick={() => setShowSearch(true)} aria-label="Search">
                <SearchIcon />
              </IconButton>

              <IconButton color="inherit" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

              <IconButton color="inherit" onClick={() => setShowShortcuts(true)} aria-label="Keyboard shortcuts">
                <HelpIcon />
              </IconButton>

              {!isMobile && (
                <>
                  {user ? (
                    <>
                      <IconButton
                        color="inherit"
                        onClick={(e) => setUserAnchorEl(e.currentTarget)}
                        aria-label="User menu"
                      >
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                          <AccountCircleIcon />
                        </Avatar>
                      </IconButton>
                      <Menu
                        anchorEl={userAnchorEl}
                        open={Boolean(userAnchorEl)}
                        onClose={() => setUserAnchorEl(null)}
                      >
                        <Box sx={{ px: 2, py: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {user.displayName || "User"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                        <Divider />
                        <MenuItem component={Link} href={profileHref} onClick={() => setUserAnchorEl(null)}>
                          Profile
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <Button variant="contained" onClick={handleLogin}>
                      Log in
                    </Button>
                  )}
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={mobileOpen} onClose={handleDrawerToggle}>
        {drawer}
      </Drawer>

      {/* Modals */}
      <SearchModal show={showSearch} onHide={() => setShowSearch(false)} />
      <KeyboardShortcutsModal show={showShortcuts} onHide={() => setShowShortcuts(false)} />
    </>
  );
}

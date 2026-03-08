"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme as useCustomTheme } from "@/components/ThemeProvider";
import { getUserByUID } from "@/lib/services/users";
import type { EffectiveMeta as EffectiveMetaType } from "@/types/tags";
import SearchModal from "@/components/navigation/SearchModal";
import KeyboardShortcutsModal from "@/components/ui/KeyboardShortcutsModal";
import { useHotkeys } from "react-hotkeys-hook";
import { cn } from "@/lib/utils";
import {
  FiMenu,
  FiX,
  FiSearch,
  FiSun,
  FiMoon,
  FiUser,
  FiChevronDown,
  FiChevronRight,
  FiShield,
  FiTool,
  FiFileText,
  FiBell,
  FiHelpCircle,
  FiLogOut,
  FiUsers,
  FiMessageSquare,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

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

// Dropdown component
function NavDropdown({
  label,
  icon,
  children,
  className,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground/80 dark:text-foreground-dark/80 hover:text-foreground dark:hover:text-foreground-dark hover:bg-surface-100 dark:hover:bg-surface-900/50 rounded-lg transition-colors"
      >
        {icon}
        {label}
        <FiChevronDown
          size={14}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 min-w-[240px] max-h-[400px] overflow-y-auto bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-xl shadow-soft-lg z-50 py-1 animate-slide-down">
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block px-4 py-2.5 text-sm text-foreground dark:text-foreground-dark hover:bg-surface-100 dark:hover:bg-surface-900/50 transition-colors",
        className,
      )}
    >
      {children}
    </Link>
  );
}

function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted dark:text-foreground-dark-muted">
      {children}
    </div>
  );
}

// Mobile sidebar accordion section
function MobileSection({
  label,
  icon,
  children,
  defaultOpen = false,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground dark:text-foreground-dark hover:bg-surface-100 dark:hover:bg-surface-900/50 transition-colors"
      >
        <span className="text-foreground-muted dark:text-foreground-dark-muted">
          {icon}
        </span>
        <span className="flex-1 text-left">{label}</span>
        <FiChevronRight
          size={14}
          className={cn(
            "text-foreground-muted transition-transform",
            open && "rotate-90",
          )}
        />
      </button>
      {open && <div className="pl-4">{children}</div>}
    </div>
  );
}

function MobileLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground dark:text-foreground-dark hover:bg-surface-100 dark:hover:bg-surface-900/50 transition-colors"
    >
      {icon && (
        <span className="text-foreground-muted dark:text-foreground-dark-muted">
          {icon}
        </span>
      )}
      {children}
    </Link>
  );
}

export default function AppNavbar() {
  const { user, logout, admin } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useCustomTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [profileHref, setProfileHref] = useState("/profile");
  const [effective, setEffective] = useState<EffectiveMeta[]>([]);
  const [_loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const tools = useMemo(
    () =>
      effective
        .filter((meta) => meta.effective.includes("Tool"))
        .sort((a, b) => (a.title || a.path).localeCompare(b.title || b.path)),
    [effective],
  );

  const handleLogin = useCallback(() => {
    setMobileOpen(false);
    router.push("/login");
  }, [router]);

  const handleLogout = useCallback(() => {
    logout();
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [logout]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b-2 border-dashed border-border dark:border-border-dark bg-card/90 dark:bg-card-dark/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Mobile menu + Brand */}
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-foreground dark:text-foreground-dark hover:bg-surface-100 dark:hover:bg-surface-900/50 transition-colors"
                aria-label="Open menu"
              >
                <FiMenu size={20} />
              </button>

              {/* Brand */}
              <Link
                href="/"
                className="flex items-center gap-2 text-foreground dark:text-foreground-dark no-underline"
              >
                <HiSparkles className="text-primary" size={22} />
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-700 bg-clip-text text-transparent">
                  The Lair of Evil
                </span>
              </Link>
            </div>

            {/* Center: Desktop navigation */}
            <div className="hidden md:flex items-center gap-1 ml-8 flex-1">
              {/* Admin Dropdown */}
              {admin && (
                <NavDropdown label="Admin" icon={<FiShield size={16} />}>
                  <DropdownItem href="/admin/cms">CMS Admin</DropdownItem>
                  <DropdownItem href="/admin/suggestions">
                    Suggestions
                  </DropdownItem>
                  <DropdownItem href="/admin/tags">
                    Tags Management
                  </DropdownItem>
                  <DropdownItem href="/admin/notifications">
                    Send Notifications
                  </DropdownItem>
                </NavDropdown>
              )}

              {/* Tools Dropdown */}
              <NavDropdown label="Tools" icon={<FiTool size={16} />}>
                <DropdownItem href="/notifications">To-Do List</DropdownItem>
                {tools.map((meta) => (
                  <DropdownItem key={meta.path} href={mapHref(meta.path)}>
                    {meta.title || meta.path}
                  </DropdownItem>
                ))}
              </NavDropdown>

              {/* Community Updates */}
              <Link
                href="/posts"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground/80 dark:text-foreground-dark/80 hover:text-foreground dark:hover:text-foreground-dark hover:bg-surface-100 dark:hover:bg-surface-900/50 rounded-lg transition-colors no-underline"
              >
                <FiFileText size={16} />
                Community Updates
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 rounded-lg text-foreground/70 dark:text-foreground-dark/70 hover:text-foreground dark:hover:text-foreground-dark hover:bg-surface-100 dark:hover:bg-surface-900/50 transition-colors"
                aria-label="Search"
              >
                <FiSearch size={18} />
              </button>

              {user && (
                <Link
                  href="/notifications"
                  className="relative p-2 rounded-lg text-foreground/70 dark:text-foreground-dark/70 hover:text-foreground dark:hover:text-foreground-dark hover:bg-surface-100 dark:hover:bg-surface-900/50 transition-colors"
                  aria-label="Notifications"
                >
                  <FiBell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold text-white bg-danger rounded-full px-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-foreground/70 dark:text-foreground-dark/70 hover:text-foreground dark:hover:text-foreground-dark hover:bg-surface-100 dark:hover:bg-surface-900/50 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>

              <button
                onClick={() => setShowShortcuts(true)}
                className="hidden sm:block p-2 rounded-lg text-foreground/70 dark:text-foreground-dark/70 hover:text-foreground dark:hover:text-foreground-dark hover:bg-surface-100 dark:hover:bg-surface-900/50 transition-colors"
                aria-label="Keyboard shortcuts"
              >
                <FiHelpCircle size={18} />
              </button>

              {/* Desktop user menu */}
              <div ref={userMenuRef} className="relative hidden md:block">
                {user ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen((o) => !o)}
                      className="flex items-center gap-2 ml-2 p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-900/50 transition-colors"
                      aria-label="User menu"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                        {(user.displayName || "U")[0].toUpperCase()}
                      </div>
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-56 bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-xl shadow-soft-lg z-50 py-1 animate-slide-down">
                        <div className="px-4 py-3 border-b border-border dark:border-border-dark">
                          <p className="text-sm font-semibold text-foreground dark:text-foreground-dark truncate">
                            {user.displayName || "User"}
                          </p>
                          <p className="text-xs text-foreground-muted dark:text-foreground-dark-muted truncate">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          href={profileHref}
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-foreground dark:text-foreground-dark hover:bg-surface-100 dark:hover:bg-surface-900/50 transition-colors no-underline"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger-50 dark:hover:bg-danger/10 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="ml-2 px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors"
                  >
                    Log in
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card dark:bg-card-dark border-r border-border dark:border-border-dark transform transition-transform duration-300 ease-in-out md:hidden overflow-y-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-border dark:border-border-dark">
          <div className="flex items-center gap-2">
            <HiSparkles className="text-primary" size={20} />
            <span className="text-lg font-bold text-foreground dark:text-foreground-dark">
              The Lair of Evil
            </span>
          </div>
          <button
            onClick={closeMobile}
            className="p-2 rounded-lg text-foreground-muted hover:bg-surface-100 dark:hover:bg-surface-900/50 transition-colors"
            aria-label="Close menu"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="py-2">
          {/* Admin Section */}
          {admin && (
            <>
              <MobileSection label="Admin" icon={<FiShield size={16} />}>
                <MobileLink href="/admin/cms" onClick={closeMobile}>
                  CMS Admin
                </MobileLink>
                <MobileLink href="/admin/suggestions" onClick={closeMobile}>
                  Suggestions
                </MobileLink>
                <MobileLink href="/admin/tags" onClick={closeMobile}>
                  Tags Management
                </MobileLink>
                <MobileLink href="/admin/notifications" onClick={closeMobile}>
                  Send Notifications
                </MobileLink>
              </MobileSection>
              <div className="mx-4 border-t border-border dark:border-border-dark" />
            </>
          )}

          {/* Tools Section */}
          <MobileSection label="Tools" icon={<FiTool size={16} />}>
            <MobileLink href="/notifications" onClick={closeMobile}>
              To-Do List
            </MobileLink>
            {tools.map((meta) => (
              <MobileLink
                key={meta.path}
                href={mapHref(meta.path)}
                onClick={closeMobile}
              >
                {meta.title || meta.path}
              </MobileLink>
            ))}
          </MobileSection>

          {/* Community Updates */}
          <MobileLink
            href="/posts"
            icon={<FiFileText size={16} />}
            onClick={closeMobile}
          >
            Community Updates
          </MobileLink>

          {/* Friends - Only show when logged in */}
          {user && (
            <MobileLink
              href="/friends"
              icon={<FiUsers size={16} />}
              onClick={closeMobile}
            >
              Friends
            </MobileLink>
          )}

          {/* Messages - Only show when logged in */}
          {user && (
            <MobileLink
              href="/messages"
              icon={<FiMessageSquare size={16} />}
              onClick={closeMobile}
            >
              Messages
            </MobileLink>
          )}
        </div>

        {/* Drawer Footer - User */}
        <div className="border-t border-border dark:border-border-dark p-4 mt-auto">
          {user ? (
            <>
              <div className="mb-3">
                <p className="text-sm font-semibold text-foreground dark:text-foreground-dark truncate">
                  {user.displayName || "User"}
                </p>
                <p className="text-xs text-foreground-muted dark:text-foreground-dark-muted truncate">
                  {user.email}
                </p>
              </div>
              <Link
                href={profileHref}
                onClick={closeMobile}
                className="block w-full text-center px-4 py-2 text-sm font-medium border border-border dark:border-border-dark rounded-lg text-foreground dark:text-foreground-dark hover:bg-surface-100 dark:hover:bg-surface-900/50 transition-colors mb-2 no-underline"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-danger border border-danger/30 rounded-lg hover:bg-danger-50 dark:hover:bg-danger/10 transition-colors"
              >
                <FiLogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full px-4 py-2.5 text-sm font-medium bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              Log in
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <SearchModal show={showSearch} onHide={() => setShowSearch(false)} />
      <KeyboardShortcutsModal
        show={showShortcuts}
        onHide={() => setShowShortcuts(false)}
      />
    </>
  );
}

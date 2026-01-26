"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FiHome, FiCalendar, FiSearch, FiUser } from "react-icons/fi";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  match: (pathname: string) => boolean;
}

export default function MobileBottomNav({
  onSearchClick,
}: {
  onSearchClick?: () => void;
}) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      icon: <FiHome size={24} />,
      label: "Home",
      href: "/",
      match: (path) => path === "/",
    },
    {
      icon: <FiCalendar size={24} />,
      label: "Events",
      href: "/phasmoTourney4Group/standings",
      match: (path) =>
        path.includes("tourney") || path.includes("phasmo") || path === "/",
    },
    {
      icon: <FiSearch size={24} />,
      label: "Search",
      href: "#",
      match: () => false,
    },
    {
      icon: <FiUser size={24} />,
      label: "Profile",
      href: "/profile",
      match: (path) => path.includes("profile") || path.includes("account"),
    },
  ];

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSearchClick?.();
  };

  return (
    <nav className="mobile-bottom-nav d-md-none">
      <div className="mobile-bottom-nav-container">
        {navItems.map((item) => {
          const isActive = item.match(pathname);
          const isSearch = item.label === "Search";

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={isSearch ? handleSearchClick : undefined}
              className={`mobile-bottom-nav-item ${isActive ? "active" : ""}`}
            >
              <div className="mobile-bottom-nav-icon">{item.icon}</div>
              <span className="mobile-bottom-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

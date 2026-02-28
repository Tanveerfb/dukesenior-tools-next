"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiChevronRight } from "react-icons/fi";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function pathToBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

  segments.forEach((segment, index) => {
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    const href = "/" + segments.slice(0, index + 1).join("/");
    breadcrumbs.push({ label, href });
  });

  return breadcrumbs;
}

export default function DynamicBreadcrumb() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const breadcrumbs = pathToBreadcrumbs(pathname);
  if (breadcrumbs.length <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-50/50 dark:bg-surface-900/30 py-3 border-b border-border dark:border-border-dark"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-1 text-sm"
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={crumb.label} className="flex items-center gap-1">
                {index > 0 && (
                  <FiChevronRight
                    size={14}
                    className="text-foreground-muted dark:text-foreground-dark-muted"
                  />
                )}
                {isLast ? (
                  <span className="text-foreground dark:text-foreground-dark font-medium">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href!}
                    className="text-foreground-muted dark:text-foreground-dark-muted hover:text-primary transition-colors no-underline"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      </div>
    </motion.div>
  );
}

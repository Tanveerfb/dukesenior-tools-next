"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "react-bootstrap";
import { motion } from "framer-motion";

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

  // Don't show breadcrumbs on home page
  if (pathname === "/") return null;

  const breadcrumbs = pathToBreadcrumbs(pathname);

  // Only show if we have meaningful breadcrumbs (more than just Home)
  if (breadcrumbs.length <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-body-secondary py-2 border-bottom"
    >
      <div className="container">
        <Breadcrumb className="mb-0">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <Breadcrumb.Item
                key={crumb.href || crumb.label}
                active={isLast}
                linkAs={isLast ? "span" : Link}
                href={isLast ? undefined : crumb.href}
              >
                {crumb.label}
              </Breadcrumb.Item>
            );
          })}
        </Breadcrumb>
      </div>
    </motion.div>
  );
}

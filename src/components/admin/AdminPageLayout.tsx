"use client";
import { ReactNode } from "react";
import { Container } from "react-bootstrap";
import Link from "next/link";

interface AdminPageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  backLink?: {
    href: string;
    label: string;
  };
}

/**
 * AdminPageLayout - Consistent layout wrapper for admin pages
 * 
 * Provides a standard header with title, subtitle, and optional back navigation
 * for all admin pages to maintain consistency across the admin interface.
 * 
 * @example
 * ```tsx
 * export default function ManageRoundPage() {
 *   return (
 *     <AdminAuthGuard>
 *       <AdminPageLayout
 *         title="Manage Round 1"
 *         subtitle="Standard Round"
 *         backLink={{ href: "/admin/phasmoTourney5", label: "Back to Admin" }}
 *       >
 *         <YourPageContent />
 *       </AdminPageLayout>
 *     </AdminAuthGuard>
 *   );
 * }
 * ```
 */
export default function AdminPageLayout({
  children,
  title,
  subtitle,
  backLink,
}: AdminPageLayoutProps) {
  return (
    <Container className="py-4">
      {backLink && (
        <div className="mb-3">
          <Link href={backLink.href} className="text-decoration-none">
            ← {backLink.label}
          </Link>
        </div>
      )}
      <div className="mb-4">
        <h1 className="h2 fw-bold">{title}</h1>
        {subtitle && <p className="text-muted">{subtitle}</p>}
      </div>
      {children}
    </Container>
  );
}

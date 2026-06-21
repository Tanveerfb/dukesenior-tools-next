"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

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
 */
export default function AdminPageLayout({
  children,
  title,
  subtitle,
  backLink,
}: AdminPageLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {backLink && (
        <div className="mb-6">
          <Link
            href={backLink.href}
            className="group inline-flex items-center gap-1.5 font-medium text-primary-500 transition-all hover:gap-2.5 hover:text-primary-400"
          >
            <FiArrowLeft className="h-4 w-4" />
            {backLink.label}
          </Link>
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-foreground-secondary">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

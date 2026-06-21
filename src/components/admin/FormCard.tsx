"use client";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  footer?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/**
 * FormCard - Reusable card component for admin forms
 *
 * Provides a consistent styled card wrapper for forms with optional
 * submit button and collapsible functionality.
 */
export default function FormCard({
  children,
  title,
  subtitle,
  onSubmit,
  submitLabel = "Submit",
  submitDisabled = false,
  footer,
  collapsible: _collapsible = false,
  defaultCollapsed: _defaultCollapsed = false,
}: FormCardProps) {
  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-md dark:border-border-dark dark:bg-card-dark">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 dark:border-border-dark">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-foreground-secondary">{subtitle}</p>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {onSubmit ? (
          <form onSubmit={onSubmit}>
            {children}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="submit"
                disabled={submitDisabled}
                className={cn(
                  "rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors",
                  submitDisabled
                    ? "cursor-not-allowed bg-primary-300 opacity-60"
                    : "bg-primary-500 hover:bg-primary-600 active:bg-primary-700",
                )}
              >
                {submitLabel}
              </button>
            </div>
          </form>
        ) : (
          children
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="border-t border-border px-6 py-3 dark:border-border-dark">
          {footer}
        </div>
      )}
    </div>
  );
}

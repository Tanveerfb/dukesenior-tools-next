"use client";
import { ReactNode } from "react";
import { Card, Button } from "react-bootstrap";

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
 *
 * @example
 * ```tsx
 * <FormCard
 *   title="Add New Result"
 *   subtitle="Enter player performance data"
 *   onSubmit={handleSubmit}
 *   submitLabel="Save Result"
 * >
 *   <YourFormFields />
 * </FormCard>
 * ```
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
  const content = (
    <>
      <Card.Header>
        <Card.Title as="h3" className="h5 fw-semibold mb-0">
          {title}
        </Card.Title>
        {subtitle && <p className="text-muted small mb-0 mt-1">{subtitle}</p>}
      </Card.Header>
      <Card.Body>
        {onSubmit ? (
          <form onSubmit={onSubmit}>
            {children}
            <div className="d-flex justify-content-end gap-2">
              <Button type="submit" variant="primary" disabled={submitDisabled}>
                {submitLabel}
              </Button>
            </div>
          </form>
        ) : (
          children
        )}
      </Card.Body>
      {footer && <Card.Footer>{footer}</Card.Footer>}
    </>
  );

  return <Card className="border-0 shadow-sm mb-4">{content}</Card>;
}

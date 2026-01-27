"use client";
import { ReactNode } from "react";
import { Card, CardHeader, CardContent, CardActions, Button, Typography, Box } from "@mui/material";

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
      <CardHeader
        title={
          <Typography variant="h6" component="h3" fontWeight={600}>
            {title}
          </Typography>
        }
        subheader={subtitle}
      />
      <CardContent>
        {onSubmit ? (
          <Box component="form" onSubmit={onSubmit}>
            {children}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitDisabled}
                sx={{ textTransform: "none" }}
              >
                {submitLabel}
              </Button>
            </Box>
          </Box>
        ) : (
          children
        )}
      </CardContent>
      {footer && <CardActions>{footer}</CardActions>}
    </>
  );

  return (
    <Card elevation={2} sx={{ mb: 4 }}>
      {content}
    </Card>
  );
}

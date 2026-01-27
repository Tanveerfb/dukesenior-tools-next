"use client";
import { ReactNode } from "react";
import { Container, Typography, Box, Link as MuiLink } from "@mui/material";
import Link from "next/link";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {backLink && (
        <Box sx={{ mb: 3 }}>
          <MuiLink
            component={Link}
            href={backLink.href}
            underline="hover"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "primary.main",
              fontWeight: 500,
              transition: "gap 0.2s",
              "&:hover": {
                gap: 1,
              },
            }}
          >
            <ArrowBackIcon fontSize="small" />
            {backLink.label}
          </MuiLink>
        </Box>
      )}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {children}
    </Container>
  );
}

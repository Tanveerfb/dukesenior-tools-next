"use client";
import { ReactNode } from "react";
import { Alert, Container } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";

interface AdminAuthGuardProps {
  children: ReactNode;
  message?: string;
}

/**
 * AdminAuthGuard - Wrapper component for admin-only pages
 * 
 * This component checks if the user has admin privileges and displays
 * the content only if authorized, otherwise shows an access denied message.
 * 
 * @example
 * ```tsx
 * export default function AdminPage() {
 *   return (
 *     <AdminAuthGuard>
 *       <YourAdminContent />
 *     </AdminAuthGuard>
 *   );
 * }
 * ```
 */
export default function AdminAuthGuard({
  children,
  message = "Admin access required.",
}: AdminAuthGuardProps) {
  const { admin } = useAuth();

  if (!admin) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning">{message}</Alert>
      </Container>
    );
  }

  return <>{children}</>;
}

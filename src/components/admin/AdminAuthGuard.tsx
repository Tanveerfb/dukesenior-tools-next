"use client";
import { ReactNode } from "react";
import { FiAlertTriangle } from "react-icons/fi";
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
 */
export default function AdminAuthGuard({
  children,
  message = "Admin access required.",
}: AdminAuthGuardProps) {
  const { admin } = useAuth();

  if (!admin) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-yellow-700 dark:text-yellow-400">
          <FiAlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

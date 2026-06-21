"use client";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ui/ToastProvider";
import { NotificationProvider } from "@/hooks/useNotifications";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

// React Query has been removed; this file no longer creates a query client.
// Devtools dynamic import removed accordingly.

export default function Providers({ children }: { children: React.ReactNode }) {
  // React Query removed; no client is needed.
  const [queryClient] = useState(null as any);

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>{children}</ToastProvider>
        </NotificationProvider>
        {/* react-hot-toast for alternative toast notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "8px",
              fontSize: "14px",
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

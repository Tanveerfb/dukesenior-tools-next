"use client";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ui/ToastProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

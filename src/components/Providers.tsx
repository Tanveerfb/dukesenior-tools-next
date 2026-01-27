"use client";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ui/ToastProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { useState, useMemo } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "@/theme/theme";
import { useTheme as useCustomTheme } from "./ThemeProvider";

// Inner component to access theme context
function MuiThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useCustomTheme();
  const muiTheme = useMemo(() => getTheme(theme as 'light' | 'dark'), [theme]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance in state to avoid creating new instance on every render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MuiThemeWrapper>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
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
        </MuiThemeWrapper>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

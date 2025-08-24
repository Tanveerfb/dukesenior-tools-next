"use client";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "./ThemeProvider";
import Topbar from "./Topbar";
import Footer from "./Footer";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Topbar />
        <div className="container-fluid p-2" style={{ minHeight: "70vh" }}>
          {children}
        </div>
        <Footer />
      </AuthProvider>
    </ThemeProvider>
  );
}

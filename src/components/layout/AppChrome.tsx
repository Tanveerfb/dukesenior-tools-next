"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import AppNavbar from "../navigation/AppNavbar";
import Footer from "../ui/Footer";
import DynamicBreadcrumb from "../navigation/DynamicBreadcrumb";
import SkipToContent from "../navigation/SkipToContent";
import PageTransition from "../ui/PageTransition";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const _pathname = usePathname();
  const search = useSearchParams();
  const embed = search?.get("embed") === "1";

  const hideChrome = embed || false;

  if (hideChrome) return <>{children}</>;
  return (
    <>
      <SkipToContent />
      <AppNavbar />
      <DynamicBreadcrumb />
      <main id="main-content">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}

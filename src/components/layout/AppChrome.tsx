"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import MainNavbar from "../navigation/MainNavbar";
import Footer from "../ui/Footer";
import DynamicBreadcrumb from "../navigation/DynamicBreadcrumb";
import SkipToContent from "../navigation/SkipToContent";
import PageTransition from "../ui/PageTransition";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const embed = search?.get("embed") === "1";

  const hideChrome = embed || false;

  if (hideChrome) return <>{children}</>;
  return (
    <>
      <SkipToContent />
      <MainNavbar />
      <DynamicBreadcrumb />
      <main id="main-content">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}

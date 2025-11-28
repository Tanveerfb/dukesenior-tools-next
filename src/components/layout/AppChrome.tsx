"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import MainNavbar from "../navigation/MainNavbar";
import Footer from "../ui/Footer";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const embed = search?.get("embed") === "1";

  const hideChrome =
    embed ||
    !!pathname?.includes("/phasmotourney-series/phasmotourney5/overlay") ||
    !!pathname?.includes("/phasmotourney-series/phasmotourney5/cards");

  if (hideChrome) return <>{children}</>;
  return (
    <>
      <MainNavbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

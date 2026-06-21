import type { Metadata } from "next";
import { Geist, Geist_Mono, Permanent_Marker, Kalam } from "next/font/google";
import "@/styles/global.scss";
import Providers from "../components/Providers";
import AppChrome from "../components/layout/AppChrome";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const permanentMarker = Permanent_Marker({
  weight: "400",
  variable: "--font-permanent-marker",
  subsets: ["latin"],
  display: "swap",
});

const kalam = Kalam({
  weight: ["300", "400", "700"],
  variable: "--font-kalam",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Lair of Evil Tools",
  description:
    "A website developed by DukeSenior for the discord server members of 'The Lair of Evil",
  icons: {
    icon: "/logos/faivcon.png",
    apple: "/logos/faivcon.png",
  },
  openGraph: {
    title: "The Lair of Evil Tools",
    description:
      "Tools, event dashboards, and community resources powering the Phasmo Tourney project and the DukeSenior community.",
    siteName: "The Lair of Evil",
    images: ["/logos/logo-square-light.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${permanentMarker.variable} ${kalam.variable}`}
      >
        <Providers>
          <AppChrome>{children}</AppChrome>
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}

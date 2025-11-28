import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/global.scss";
import Providers from "../components/Providers";
import AppChrome from "../components/layout/AppChrome";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Lair of Evil Tools",
  description:
    "A website developed by DukeSenior for the discord server members of 'The Lair of Evil",
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
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <Providers>
          <AppChrome>{children}</AppChrome>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}

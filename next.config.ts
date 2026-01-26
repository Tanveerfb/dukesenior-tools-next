import type { NextConfig } from "next";
import path from "path";

// Bundle analyzer support
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

// Configure remote image hosts used across the app (post banners, user avatars, Firebase storage, etc.)
const nextConfig: NextConfig = {
  // Add empty turbopack config to suppress Next.js 16 warning
  turbopack: {},
  sassOptions: {
    includePaths: [
      path.join(process.cwd(), "node_modules"),
      path.join(process.cwd(), "node_modules", "bootstrap", "scss"),
      path.join(process.cwd(), "src", "styles"),
    ],
  },
  images: {
    // Using remotePatterns for explicit control; add hosts here as needed.
    remotePatterns: [
      { protocol: "https", hostname: "i.pinimg.com" }, // Pinterest images (existing banner example)
      { protocol: "https", hostname: "clan.akamai.steamstatic.com" }, // Steam-hosted images used as banners
      { protocol: "https", hostname: "firebasestorage.googleapis.com" }, // Firebase Storage uploads
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google user avatars
      { protocol: "https", hostname: "avatars.githubusercontent.com" }, // potential GitHub avatars (future use)
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com https://fonts.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://vercel.live wss://*.firebaseio.com https://va.vercel-scripts.com",
              "frame-src 'self' https:",
              "media-src 'self' https:",
            ]
              .join("; ")
              .replace(/\s+/g, " "),
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);

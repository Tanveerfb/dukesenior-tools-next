import type { NextConfig } from "next";
import path from "path";

// Configure remote image hosts used across the app (post banners, user avatars, Firebase storage, etc.)
const nextConfig: NextConfig = {
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
};

export default nextConfig;

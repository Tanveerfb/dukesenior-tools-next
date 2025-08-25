import type { NextConfig } from "next";

// Configure remote image hosts used across the app (post banners, user avatars, Firebase storage, etc.)
const nextConfig: NextConfig = {
  images: {
    // Using remotePatterns for explicit control; add hosts here as needed.
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pinimg.com' }, // Pinterest images (existing banner example)
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' }, // Firebase Storage uploads
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google user avatars
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' } // potential GitHub avatars (future use)
    ]
  }
};

export default nextConfig;

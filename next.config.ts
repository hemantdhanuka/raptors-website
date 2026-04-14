import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow CricHeroes profile pictures and any CDN they use
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

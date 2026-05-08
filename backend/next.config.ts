import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This is an API-only Next.js app — no frontend pages
  // All traffic goes through /api/* routes

  // Allow cross-origin requests from the frontend dev server
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: process.env.CORS_ORIGIN ?? "*" },
          { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },

  // Increase the default body size limit for large simulation payloads
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;

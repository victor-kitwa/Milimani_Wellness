import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        // Runtime product/category image uploads land in Vercel Blob
        // storage in production (see src/server/upload-actions.ts); each
        // store gets its own subdomain, hence the wildcard.
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // Applies to every response, including static files, so this is the one
  // place these need setting rather than in proxy.ts (which only touches
  // the routes it explicitly runs on).
  //
  // Deliberately not setting Content-Security-Policy here: getting one
  // right for this app (Google Analytics, Unsplash images, Next's own
  // inline hydration scripts, IntaSend's checkout flow) needs testing
  // against a live browser this environment can't do, and a broken CSP
  // that blocks a real script is worse than no CSP at all. Recommended as
  // a follow-up once it can be verified against the running site.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;

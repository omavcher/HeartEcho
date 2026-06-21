/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Image Optimization ───────────────────────────────────────────
  // unoptimized: true → bypasses Vercel's paid Image Optimization API.
  // Local images are pre-compressed with Sharp (76MB+ savings done).
  // Cloudinary images are pre-optimized from Cloudinary CDN directly.
  // Fixes: OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED error.
  images: {
    unoptimized: true,           // Serve images as-is (already Sharp-compressed)
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'thumbs.dreamstime.com' },
      { protocol: 'https', hostname: 'cdn.heartecho.in' },
    ],
    minimumCacheTTL: 31536000,   // Still cache 1 year on client side
  },

  // ─── Build & Bundle Optimizations ─────────────────────────────────
  eslint:  { ignoreDuringBuilds: true },
  swcMinify: true,           // SWC minifier (faster + smaller than Terser)
  compress: true,            // Enable gzip compression on all responses
  poweredByHeader: false,    // Remove X-Powered-By header

  // ─── Experimental: Partial Pre-rendering & optimised packages ─────
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      'framer-motion',
      'recharts',
      'date-fns',
    ],
    // Inline critical CSS automatically
    optimizeCss: false, // set true only if critters pkg installed
  },

  // ─── Security + Cache Headers ─────────────────────────────────────
  async headers() {
    return [
      // ── Security headers on all routes (SEO trust signal) ──
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security',value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default nextConfig;

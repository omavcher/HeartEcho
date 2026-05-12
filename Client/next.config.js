/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Image Optimization (auto WebP/AVIF conversion) ───────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'thumbs.dreamstime.com' },
      { protocol: 'https', hostname: 'cdn.heartecho.in' },
    ],
    formats: ['image/avif', 'image/webp'],   // serve smallest format
    minimumCacheTTL: 31536000,               // cache images 1 year
    deviceSizes: [360, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
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

  // ─── Long-lived cache headers for static assets ───────────────────
  async headers() {
    return [
      {
        source: '/(.*)\\.(jpg|jpeg|png|webp|avif|svg|gif|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)\\.(mp3|mp4|webm)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;

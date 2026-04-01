/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'thumbs.dreamstime.com', 'cdn.heartecho.in'], // ✅ Allow Cloudinary and HeartEcho CDN
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Prevent ESLint errors from blocking builds
  },
};

export default nextConfig;

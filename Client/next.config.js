/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'], // ✅ Allow Cloudinary
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Prevent ESLint errors from blocking builds
  },
};

export default nextConfig;

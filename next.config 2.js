/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['localhost', 'digiclickai.com', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const path = require('path');

// Try to load next-pwa but don't fail if it's not available
let withPWA;
try {
  withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
  });
} catch (e) {
  console.warn('next-pwa not found, continuing without PWA support');
  withPWA = (config) => config;
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'mdtstech.store', 'images.unsplash.com', '*'],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true, // This helps with Netlify deployment
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  staticPageGenerationTimeout: 300, // Increased timeout for Netlify
  swcMinify: true, // Use SWC for minification
  productionBrowserSourceMaps: false, // Disable source maps in production
  experimental: {
    forceSwcTransforms: true,
    optimizeCss: true,
    scrollRestoration: true,
  },
  webpack: (config, { isServer }) => {
    // Add aliases for common directories
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': path.resolve(__dirname, 'components'),
      '@styles': path.resolve(__dirname, 'styles'),
      '@lib': path.resolve(__dirname, 'lib'),
    };

    // Optimize bundle size
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  }
};

module.exports = withPWA(nextConfig);

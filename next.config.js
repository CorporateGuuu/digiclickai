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

  // Enable static export for Netlify
  output: 'export',
  trailingSlash: true,
  distDir: 'out',

  images: {
    domains: ['localhost', 'mdtstech.store', 'images.unsplash.com', '*'],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true, // Required for static export
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

  // Enhanced cursor system environment variables
  env: {
    NEXT_PUBLIC_CURSOR_PERFORMANCE_MODE: process.env.NEXT_PUBLIC_CURSOR_PERFORMANCE_MODE || 'high',
    NEXT_PUBLIC_ENABLE_PARTICLE_TRAILS: process.env.NEXT_PUBLIC_ENABLE_PARTICLE_TRAILS || 'true',
    NEXT_PUBLIC_ENABLE_CLICK_EFFECTS: process.env.NEXT_PUBLIC_ENABLE_CLICK_EFFECTS || 'true',
    NEXT_PUBLIC_ENABLE_GLOW_EFFECTS: process.env.NEXT_PUBLIC_ENABLE_GLOW_EFFECTS || 'true',
  },

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

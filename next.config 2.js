/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: &apos;public',
  disable: process.env.NODE_ENV === &apos;development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', &apos;mdtstech.store', &apos;images.unsplash.com'],
    formats: ['image/avif', &apos;image/webp'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === &apos;production',
  },
  experimental: {
    scrollRestoration: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: &apos;X-Content-Type-Options',
            value: &apos;nosniff',
          },
          {
            key: &apos;X-Frame-Options',
            value: &apos;DENY',
          },
          {
            key: &apos;X-XSS-Protection',
            value: &apos;1; mode=block',
          },
        ],
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: &apos;all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: &apos;commons',
            chunks: &apos;all',
            minChunks: 2,
          },
          react: {
            name: &apos;react',
            chunks: &apos;all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 20,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `npm.${packageName.replace('@', '')}`;
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};

module.exports = withPWA(nextConfig);

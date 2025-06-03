/** @type {import('next').NextConfig} */
const path = require('path');

// Try to load next-pwa but don't fail if it's not available
let withPWA;
withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  publicExcludes: ['!noprecache/**/*'],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:json|xml|csv)$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'static-data-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\/api\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'apis',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 12 * 60 * 60 // 12 hours
        },
        networkTimeoutSeconds: 10
      }
    },
    {
      urlPattern: /.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'others',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 10
      }
    }
  ]
});

const nextConfig = {
  reactStrictMode: true,

  // Enable static export for Netlify
  // output: 'export',
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
 // Use SWC for minification
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
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer in development
    if (dev && !isServer && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: false,
        })
      );
    }

    // Add aliases for common directories
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': path.resolve(__dirname, 'components'),
      '@styles': path.resolve(__dirname, 'styles'),
      '@lib': path.resolve(__dirname, 'lib'),
      '@src': path.resolve(__dirname, 'src'),
      // GSAP tree shaking
      'gsap/all': 'gsap/index.js',
    };

    // Enhanced bundle optimization
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 500000,
          cacheGroups: {
            // GSAP chunk
            gsap: {
              test: /[\\/]node_modules[\\/]gsap[\\/]/,
              name: 'gsap',
              chunks: 'all',
              priority: 30,
              enforce: true,
            },

            // Particles.js chunk
            particles: {
              test: /[\\/]node_modules[\\/]particles\.js[\\/]/,
              name: 'particles',
              chunks: 'all',
              priority: 25,
              enforce: true,
            },

            // Cursor variants chunks
            cursorVariants: {
              test: /[\\/]src[\\/]components[\\/]cursor[\\/]variants[\\/]/,
              name: 'cursor-variants',
              chunks: 'all',
              priority: 20,
            },

            // React chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 15,
              enforce: true,
            },

            // Vendor chunk for other libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              minChunks: 2,
            },

            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Performance optimizations
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/gsap/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            ['babel-plugin-transform-imports', {
              'gsap': {
                'transform': 'gsap/${member}',
                'preventFullImport': true
              }
            }]
          ]
        }
      }
    });

    return config;
  }
};

module.exports = withPWA(nextConfig);

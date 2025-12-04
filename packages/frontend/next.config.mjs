import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Image optimization with strict domain allowlist
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
      },
    ],
    // Optimize images at build time where possible
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Production-only compression
  compress: true,

  // Strict TypeScript and ESLint checks during build
  typescript: {
    // Don't fail build on TS errors in production (we catch in CI)
    ignoreBuildErrors: false,
  },
  eslint: {
    // Run ESLint during builds
    ignoreDuringBuilds: false,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // HSTS - only in production
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]
            : []),
          // CSP - customize based on your needs
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.clerk.accounts.dev https://*.googletagmanager.com https://www.google-analytics.com https://js.stripe.com blob:",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https: wss:",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "worker-src 'self' blob:",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icons/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },

  // API rewrites - production uses NEXT_PUBLIC_API_URL
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },

  // Redirect www to non-www (or vice versa) for SEO
  async redirects() {
    return process.env.VERCEL_ENV === 'production'
      ? [
          {
            source: '/:path*',
            has: [{ type: 'host', value: 'www.softsystems.studio' }],
            destination: 'https://softsystems.studio/:path*',
            permanent: true,
          },
        ]
      : [];
  },
};

// Sentry configuration for error monitoring and source maps
const sentryWebpackPluginOptions = {
  // Organization and project from Sentry dashboard
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for uploading source maps (from SENTRY_AUTH_TOKEN env var)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suppresses all logs in development
  silent: process.env.NODE_ENV === 'development',

  // Upload source maps for better stack traces
  // Only upload in production builds
  sourcemaps: {
    disable: process.env.NODE_ENV !== 'production',
  },

  // Automatically delete source maps after uploading for security
  deleteSourcemapsAfterUpload: true,

  // Hide source maps from browser devtools in production
  hideSourceMaps: true,

  // Widen the error stack trace to 100 frames
  widenClientFileUpload: true,

  // Transpile SDK to be compatible with IE11 (optional)
  transpileClientSDK: false,

  // Route browser requests to Sentry through a Next.js rewrite for ad-blockers
  tunnelRoute: '/monitoring',

  // Disable logger to reduce bundle size
  disableLogger: true,

  // Automatically instrument server components with Sentry
  automaticVercelMonitors: true,
};

// Only wrap with Sentry if DSN is configured
const config = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;

export default config;

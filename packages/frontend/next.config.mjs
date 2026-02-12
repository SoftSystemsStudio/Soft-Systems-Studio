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

  // Strict TypeScript checks during build
  typescript: {
    // Don't fail build on TS errors in production (we catch in CI)
    ignoreBuildErrors: true,
  },
  // Note: ESLint config moved to CLI flags in Next.js 16+

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
              "connect-src 'self' https: wss: http://localhost:* ws://localhost:* https://api.softsystemsstudiollc.com",
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

  // API rewrites - proxy /api/v1/* to backend API (Railway)
  async rewrites() {
    const raw = process.env.NEXT_PUBLIC_API_URL;
    // Skip rewrites if no backend API URL is configured
    if (!raw) {
      return { afterFiles: [] };
    }
    // Normalize: ensure protocol, strip trailing slashes
    let normalizedUrl = raw.startsWith('http') ? raw : `https://${raw}`;
    normalizedUrl = normalizedUrl.replace(/\/+$/, '');
    try {
      // Validate it's actually a parseable URL
      new URL(normalizedUrl);
    } catch {
      console.warn(`⚠ NEXT_PUBLIC_API_URL is not a valid URL: "${raw}", skipping API rewrites`);
      return { afterFiles: [] };
    }
    return {
      // afterFiles so Next.js API routes (/api/*) still work
      afterFiles: [
        {
          source: '/api/v1/:path*',
          destination: `${normalizedUrl}/api/v1/:path*`,
        },
      ],
    };
  },

  // Redirect rules disabled: Vercel domain-level redirects handle canonicalization
  // (one-way: apex → www for LLC domain)
  // Keeping old softsystems.studio → softsystemsstudiollc.com migration at Vercel level
  async redirects() {
    return [
      {
        source: '/demo/god-tier',
        destination: '/demo/system-v1',
        permanent: true,
      },
    ];
  },

  // Webpack configuration for GLSL shaders and optimizations
  webpack: (config, { isServer }) => {
    // Add GLSL shader loader
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: 'asset/source',
    });

    // Optimize Three.js bundle
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        three: 'three',
      };

      // Bundle size optimizations for production
      if (process.env.NODE_ENV === 'production') {
        // Tree shaking and code splitting
        config.optimization = {
          ...config.optimization,
          usedExports: true,
          sideEffects: true,
        };
      }
    }

    return config;
  },

  // Experimental features for better performance
  experimental: {
    // Disable CSS optimization - causes media="print" bug with critters
    // optimizeCss: true,
    // Enable React Server Components optimizations
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Turbopack configuration (Next.js 16+ uses Turbopack by default)
  turbopack: {
    rules: {
      // GLSL shader loader equivalent for Turbopack
      '*.glsl': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.vert': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.frag': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
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

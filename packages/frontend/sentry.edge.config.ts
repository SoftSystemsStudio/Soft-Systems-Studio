/**
 * Sentry Edge Runtime Configuration
 *
 * This file configures the Sentry SDK for edge runtime (middleware, edge API routes).
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment and release identification
  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_RELEASE_VERSION,

  // Performance Monitoring
  // Capture 10% of transactions in production, 100% in development
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Only enable in production/staging
  enabled: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging',

  // Debug mode for development
  debug: false,
});

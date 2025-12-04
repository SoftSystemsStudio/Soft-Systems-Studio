/**
 * Sentry Server-Side Configuration
 *
 * This file configures the Sentry SDK for server-side error tracking in Next.js.
 * It runs in Node.js environments (SSR, API routes, getServerSideProps, etc.)
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

  // Debug mode for development (set to true to see Sentry logs)
  debug: false,

  // Filter out common errors that are not actionable
  ignoreErrors: [
    // Network errors
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'EPIPE',
    'socket hang up',
    // Client errors
    'Request aborted',
    'AbortError',
    // Rate limiting
    'Too Many Requests',
    'Rate limit exceeded',
  ],

  // Scrub sensitive data from events before sending
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Sentry] Server event captured (not sent in dev):', hint.originalException);
      return null;
    }

    // Scrub sensitive headers
    if (event.request?.headers) {
      const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
      const headers = event.request.headers as Record<string, string>;
      sensitiveHeaders.forEach((header) => {
        if (header in headers) {
          headers[header] = '[REDACTED]';
        }
      });
    }

    return event;
  },
});

/**
 * Sentry Client-Side Configuration
 *
 * This file configures the Sentry SDK for client-side (browser) error tracking.
 * It runs on every page load and captures JavaScript errors, performance data,
 * and session replays.
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

  // Session Replay for debugging user issues
  // Capture 10% of all sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Enable Sentry (set to true to test in development)
  enabled: true,

  // Debug mode for development (set to true to see Sentry logs)
  debug: process.env.NODE_ENV === 'development',

  // Filter out common browser errors that are not actionable
  ignoreErrors: [
    // Network errors
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    'NetworkError',
    'net::ERR_',
    'AbortError',
    // Browser extensions
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    // Common benign errors
    'ResizeObserver loop',
    'Non-Error promise rejection',
    'Script error',
    // User-caused errors
    'Request aborted',
    'cancelled',
  ],

  // URLs to ignore from error tracking
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    /^moz-extension:\/\//i,
    // Facebook/social widgets
    /graph\.facebook\.com/i,
    /connect\.facebook\.net/i,
    // Analytics
    /google-analytics\.com/i,
    /googletagmanager\.com/i,
  ],

  // Scrub sensitive data from events before sending
  beforeSend(event, hint) {
    // Log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Sentry] Sending event:', hint.originalException);
    }

    // Scrub sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
        if (breadcrumb.category === 'fetch' && breadcrumb.data?.url) {
          try {
            const url = new URL(breadcrumb.data.url, window.location.origin);
            const sensitiveParams = ['token', 'key', 'secret', 'password', 'auth', 'api_key'];
            sensitiveParams.forEach((param) => {
              if (url.searchParams.has(param)) {
                url.searchParams.set(param, '[REDACTED]');
              }
            });
            breadcrumb.data.url = url.toString();
          } catch {
            // Ignore URL parsing errors
          }
        }
        return breadcrumb;
      });
    }

    return event;
  },

  // Add integrations
  integrations: [
    Sentry.replayIntegration({
      // Block capturing text content of elements with sensitive data
      maskAllText: false,
      blockAllMedia: false,
      // Mask inputs by default for privacy
      maskAllInputs: true,
    }),
    Sentry.browserTracingIntegration({
      // Trace requests to our API
      tracePropagationTargets: ['localhost', /^\//, /softsystems\.studio/, /vercel\.app/],
    }),
  ],
});

/**
 * Sentry Error Tracking Configuration
 *
 * Initializes Sentry for production error tracking, performance monitoring,
 * and source map support.
 *
 * @module sentry
 */

import * as Sentry from '@sentry/node';
import type { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from 'express';
import env from './env';
import { logger } from './logger';

// Flag to track initialization
let isInitialized = false;

/**
 * Initialize Sentry error tracking
 *
 * Only initializes in production/staging environments when SENTRY_DSN is set.
 * Safe to call multiple times - will only initialize once.
 */
export function initSentry(): void {
  if (isInitialized) {
    return;
  }

  const dsn = process.env.SENTRY_DSN;

  // Skip initialization if no DSN or in development/test
  if (!dsn) {
    if (env.NODE_ENV === 'production') {
      logger.warn('SENTRY_DSN not set - error tracking disabled in production');
    }
    return;
  }

  if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
    logger.info('Sentry disabled in development/test environment');
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: env.NODE_ENV,
      release: process.env.GIT_COMMIT_SHA || process.env.COMMIT_SHA || 'unknown',

      // Performance monitoring
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in staging

      // Filter out common noise
      ignoreErrors: [
        // Network errors that are user-caused
        'ECONNRESET',
        'ECONNREFUSED',
        'ETIMEDOUT',
        'EPIPE',
        // Client errors
        'Request aborted',
        'socket hang up',
        // Rate limiting
        'Too Many Requests',
        'Rate limit exceeded',
      ],

      // Don't send PII
      sendDefaultPii: false,

      // Breadcrumb filtering
      beforeBreadcrumb(breadcrumb) {
        // Filter out sensitive query parameters
        if (breadcrumb.category === 'http' && breadcrumb.data?.url) {
          try {
            const urlStr = String(breadcrumb.data.url);
            const url = new URL(urlStr, 'http://localhost');
            const sensitiveParams = ['token', 'key', 'secret', 'password', 'auth'];
            for (const param of sensitiveParams) {
              if (url.searchParams.has(param)) {
                url.searchParams.set(param, '[REDACTED]');
              }
            }
            breadcrumb.data.url = url.pathname + url.search;
          } catch {
            // Ignore URL parsing errors
          }
        }
        return breadcrumb;
      },

      // Event filtering
      beforeSend(event, hint) {
        // Scrub sensitive data from errors
        if (event.request?.headers) {
          const headers = event.request.headers as Record<string, string>;
          const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
          for (const header of sensitiveHeaders) {
            if (Object.prototype.hasOwnProperty.call(headers, header)) {
              headers[header] = '[REDACTED]';
            }
          }
        }

        // Log the error ID for correlation
        const error = hint.originalException;
        if (error instanceof Error) {
          logger.error(
            { sentryEventId: event.event_id, error: error.message },
            'Error captured by Sentry',
          );
        }

        return event;
      },
    });

    isInitialized = true;
    logger.info({ environment: env.NODE_ENV }, 'Sentry initialized');
  } catch (error) {
    logger.error({ err: error }, 'Failed to initialize Sentry');
  }
}

/**
 * Capture an exception with Sentry
 *
 * @param error - The error to capture
 * @param context - Additional context to attach to the error
 * @returns The Sentry event ID (or undefined if Sentry is not initialized)
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>,
): string | undefined {
  if (!isInitialized) {
    return undefined;
  }

  return Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message with Sentry
 *
 * @param message - The message to capture
 * @param level - Severity level
 * @param context - Additional context
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info',
  context?: Record<string, unknown>,
): string | undefined {
  if (!isInitialized) {
    return undefined;
  }

  return Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Set user context for Sentry events
 *
 * @param user - User information to attach to events
 */
export function setUser(user: { id: string; email?: string; workspaceId?: string }): void {
  if (!isInitialized) {
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    // Add workspace as a custom field
    ...(user.workspaceId && { workspace: user.workspaceId }),
  });
}

/**
 * Clear user context
 */
export function clearUser(): void {
  if (!isInitialized) {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Add a breadcrumb for tracing
 *
 * @param breadcrumb - Breadcrumb data
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  if (!isInitialized) {
    return;
  }

  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Express error handler middleware for Sentry
 *
 * Captures errors and sends them to Sentry before passing to the next handler.
 */
export const sentryErrorHandler: ErrorRequestHandler = (
  err: Error & { status?: number; statusCode?: number },
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (!isInitialized) {
    next(err);
    return;
  }

  const status = err.status || err.statusCode || 500;

  // Only capture 5xx errors in production, all errors otherwise
  if (env.NODE_ENV !== 'production' || status >= 500) {
    Sentry.captureException(err, {
      extra: {
        url: req.url,
        method: req.method,
        status,
      },
    });
  }

  next(err);
};

/**
 * Express request handler middleware for Sentry
 *
 * Initializes Sentry context for the request.
 */
export const sentryRequestHandler: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (!isInitialized) {
    next();
    return;
  }

  // Set request context for better error reports
  Sentry.setContext('request', {
    url: req.url,
    method: req.method,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
    },
  });

  next();
};

export { Sentry };

export default {
  init: initSentry,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  sentryErrorHandler,
  sentryRequestHandler,
};

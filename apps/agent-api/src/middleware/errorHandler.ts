/**
 * Global Error Handler for Express
 * Provides centralized error handling with proper logging and response formatting
 */
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { captureException } from '../sentry';
import { logger } from '../logger';

/**
 * Custom application error class with status codes
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error factory functions
export const NotFoundError = (resource: string = 'Resource') =>
  new AppError(`${resource} not found`, 404, 'NOT_FOUND');

export const UnauthorizedError = (message: string = 'Authentication required') =>
  new AppError(message, 401, 'UNAUTHORIZED');

export const ForbiddenError = (message: string = 'Access denied') =>
  new AppError(message, 403, 'FORBIDDEN');

export const BadRequestError = (message: string = 'Invalid request') =>
  new AppError(message, 400, 'BAD_REQUEST');

export const ConflictError = (message: string = 'Resource already exists') =>
  new AppError(message, 409, 'CONFLICT');

export const RateLimitError = (message: string = 'Too many requests') =>
  new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');

/**
 * Error response format
 */
interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
  stack?: string;
}

/**
 * Format Zod validation errors
 */
function formatZodError(error: ZodError): ErrorResponse {
  return {
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}

/**
 * Check if error is a Prisma unique constraint violation
 */
function isPrismaUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  );
}

/**
 * Global error handling middleware
 * Must be registered last in the middleware chain
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Prepare error context for logging
  const errorContext = {
    message: err.message,
    url: req.url,
    method: req.method,
    userId: (req as { userId?: string }).userId,
    workspaceId: (req as { workspaceId?: string }).workspaceId,
    requestId: (req as { id?: string }).id,
  };

  // Capture error with Sentry for 5xx errors
  if (!(err instanceof AppError) || err.statusCode >= 500) {
    const sentryId = captureException(err, errorContext);
    if (sentryId) {
      logger.error({ err, sentryId, ...errorContext }, 'Error captured by Sentry');
    }
  }

  // Log error with structured logging
  if (process.env.NODE_ENV !== 'test') {
    if (err instanceof AppError && err.statusCode < 500) {
      logger.warn({ err, ...errorContext }, 'Client error');
    } else {
      logger.error({ err, ...errorContext }, 'Server error');
    }
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json(formatZodError(err));
    return;
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      error: err.message,
      code: err.code,
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Prisma unique constraint errors
  if (isPrismaUniqueConstraintError(err)) {
    res.status(409).json({
      error: 'Resource already exists',
      code: 'DUPLICATE_ENTRY',
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
    return;
  }

  // Handle unknown errors (don't leak details in production)
  const isProduction = process.env.NODE_ENV === 'production';

  const response: ErrorResponse = {
    error: isProduction ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
  };

  if (!isProduction) {
    response.stack = err.stack;
  }

  res.status(500).json(response);
}

/**
 * Wrapper for async route handlers to catch errors and pass to error middleware
 *
 * @example
 * router.get('/users/:id', asyncHandler(async (req, res) => {
 *   const user = await getUser(req.params.id);
 *   if (!user) throw NotFoundError('User');
 *   res.json(user);
 * }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 handler for unmatched routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `Route ${req.method} ${req.url} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
}

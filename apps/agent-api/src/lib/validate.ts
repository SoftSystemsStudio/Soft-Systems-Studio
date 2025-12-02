/**
 * Zod validation middleware for Express
 * Provides type-safe request validation with detailed error responses
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, z } from 'zod';

/**
 * Validation error response format
 */
interface ValidationErrorResponse {
  error: 'Validation failed';
  details: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Format Zod errors into a user-friendly response
 */
function formatZodError(error: ZodError): ValidationErrorResponse {
  return {
    error: 'Validation failed',
    details: error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}

/**
 * Middleware to validate request body against a Zod schema
 * Returns 400 with detailed errors on validation failure
 *
 * @example
 * const loginSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8)
 * });
 *
 * router.post('/login', validateBody(loginSchema), (req, res) => {
 *   // req.body is now typed and validated
 * });
 */
export function validateBody<T extends ZodSchema>(
  schema: T,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json(formatZodError(result.error));
      return;
    }

    // Replace body with parsed/transformed data
    req.body = result.data;
    next();
  };
}

/**
 * Middleware to validate request query parameters against a Zod schema
 */
export function validateQuery<T extends ZodSchema>(
  schema: T,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      res.status(400).json(formatZodError(result.error));
      return;
    }

    req.query = result.data;
    next();
  };
}

/**
 * Middleware to validate request params against a Zod schema
 */
export function validateParams<T extends ZodSchema>(
  schema: T,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      res.status(400).json(formatZodError(result.error));
      return;
    }

    req.params = result.data;
    next();
  };
}

// ============================================
// Common reusable schemas
// ============================================

/**
 * UUID parameter schema
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

/**
 * Pagination query schema
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
});

/**
 * Email schema with normalization
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .transform((val) => val.toLowerCase().trim());

/**
 * Password schema with strength requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Slug/handle schema (URL-safe identifiers)
 */
export const slugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(50, 'Slug must be at most 50 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

// Re-export zod for convenience
export { z };

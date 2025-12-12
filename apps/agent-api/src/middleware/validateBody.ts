import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const issues = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));

      // Centralized error shape for validation
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        issues,
      });
    }

    // Attach parsed, typed body to request for downstream consumers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).validatedBody = result.data;
    return next();
  };
}

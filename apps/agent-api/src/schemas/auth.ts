/**
 * Zod schemas for authentication endpoints
 */
import { z } from 'zod';
import { emailSchema, passwordSchema, slugSchema } from '../lib/validate';

/**
 * Login request schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Registration/Onboarding request schema
 */
export const onboardingSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  workspaceName: z
    .string()
    .min(2, 'Workspace name must be at least 2 characters')
    .max(100, 'Workspace name must be at most 100 characters')
    .trim(),
  workspaceSlug: slugSchema,
});

/**
 * Refresh token request schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required').optional(),
});

/**
 * Revoke token request schema
 */
export const revokeTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Type exports for use in handlers
export type LoginInput = z.infer<typeof loginSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type RevokeTokenInput = z.infer<typeof revokeTokenSchema>;

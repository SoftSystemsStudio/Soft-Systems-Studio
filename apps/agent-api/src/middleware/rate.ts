import rateLimit from 'express-rate-limit';

// Limit onboarding creations: e.g., 5 per hour per IP
export const onboardingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_requests' }
});

// Limit login attempts: e.g., 10 per 15 minutes per IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_requests' }
});

export default { onboardingLimiter, loginLimiter };

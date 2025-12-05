/**
 * Input Sanitization Utilities
 *
 * Security-focused input validation and sanitization functions
 * to prevent injection attacks and ensure data integrity.
 */

/**
 * List of keys that should never be allowed in user input
 * to prevent prototype pollution attacks
 */
const FORBIDDEN_KEYS = new Set([
  '__proto__',
  'prototype',
  'constructor',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
]);

/**
 * Check if a key is safe to use (not a prototype pollution vector)
 */
export function isSafeKey(key: string): boolean {
  return !FORBIDDEN_KEYS.has(key);
}

/**
 * Recursively sanitize an object to remove prototype pollution vectors
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === 'object' && item !== null
        ? sanitizeObject(item as Record<string, unknown>)
        : item,
    ) as unknown as T;
  }

  const sanitized: Record<string, unknown> = {};

  for (const key of Object.keys(obj)) {
    if (!isSafeKey(key)) {
      console.warn(`[security] Blocked potentially dangerous key: ${key}`);
      continue;
    }

    const value = obj[key];
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Sanitize a string to prevent basic XSS attacks
 * Note: This is a basic sanitizer - use a proper library like DOMPurify for HTML content
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate that a string matches expected format (alphanumeric + allowed chars)
 */
export function isValidIdentifier(
  input: string,
  options: { allowDashes?: boolean; allowUnderscores?: boolean; maxLength?: number } = {},
): boolean {
  const { allowDashes = true, allowUnderscores = true, maxLength = 128 } = options;

  if (typeof input !== 'string' || input.length === 0 || input.length > maxLength) {
    return false;
  }

  let pattern = '^[a-zA-Z0-9';
  if (allowDashes) pattern += '\\-';
  if (allowUnderscores) pattern += '_';
  pattern += ']+$';

  return new RegExp(pattern).test(input);
}

/**
 * Validate UUID format
 */
export function isValidUUID(input: string): boolean {
  if (typeof input !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(input);
}

/**
 * Validate email format (basic validation)
 */
export function isValidEmail(input: string): boolean {
  if (typeof input !== 'string' || input.length > 254) return false;
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
}

/**
 * Truncate string to max length safely
 */
export function truncateString(input: string, maxLength: number): string {
  if (typeof input !== 'string') return '';
  if (input.length <= maxLength) return input;
  return input.slice(0, maxLength);
}

/**
 * Safe JSON parse that prevents prototype pollution
 */
export function safeJsonParse<T = unknown>(json: string): T | null {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (typeof parsed === 'object' && parsed !== null) {
      return sanitizeObject(parsed as Record<string, unknown>) as T;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

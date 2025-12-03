/**
 * Pino Logger Configuration
 * Structured logging with request context and environment-aware formatting
 */
import pino from 'pino';
import pinoHttp from 'pino-http';
import type { LoggerOptions } from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

/**
 * Base logger configuration
 */
const baseOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  // Disable logging in test environment unless explicitly enabled
  enabled: !isTest || process.env.LOG_ENABLED === 'true',
  // Add standard fields
  base: {
    service: 'agent-api',
    env: process.env.NODE_ENV || 'development',
  },
  // Redact sensitive fields from logs
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.adminPassword',
      'req.body.refreshToken',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },
  // Format timestamp as ISO string in production
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
};

/**
 * Development transport with pretty printing
 */
const devTransport: LoggerOptions['transport'] = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname,service,env',
    singleLine: false,
  },
};

/**
 * Production logger - JSON output for log aggregators
 */
const productionOptions: LoggerOptions = {
  ...baseOptions,
  // Use default JSON formatter for production (no transport)
};

/**
 * Development logger - pretty printed output
 */
const developmentOptions: LoggerOptions = {
  ...baseOptions,
  transport: devTransport,
};

/**
 * Create the base logger instance
 */
export const logger = pino(isProduction ? productionOptions : developmentOptions);

/**
 * HTTP request logging middleware
 * Attach to Express app: app.use(httpLogger)
 */
export const httpLogger = pinoHttp({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  logger: logger as any,
  // Generate request IDs
  genReqId: (req, res) => {
    const existingId = req.headers['x-request-id'];
    if (existingId) return existingId as string;

    const id = `req-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    res.setHeader('x-request-id', id);
    return id;
  },
  // Customize log level based on status code
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  // Customize success message
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} completed ${res.statusCode}`;
  },
  // Customize error message
  customErrorMessage: (_req, res, err) => {
    return `Request failed with status ${res.statusCode}: ${err?.message || 'Unknown error'}`;
  },
  // Add custom attributes to request log
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    reqId: 'requestId',
    responseTime: 'duration',
  },
  // Don't log health check endpoints to reduce noise
  autoLogging: {
    ignore: (req) => {
      const url = req.url || '';
      return url.includes('/health') || url.includes('/ready');
    },
  },
});

/**
 * Create a child logger with additional context
 *
 * @example
 * const log = createChildLogger({ workspaceId: 'abc123', userId: 'user1' });
 * log.info('Processing request');
 */
export function createChildLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings);
}

/**
 * Log levels for convenience
 */
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  fatal: logger.fatal.bind(logger),
};

export default logger;

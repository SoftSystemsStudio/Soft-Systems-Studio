/**
 * Tests for metrics endpoint security
 */
import request from 'supertest';
import express, { Express } from 'express';
import { requireMetricsAuth } from '../../src/middleware/requireMetricsAuth';
import { rateLimitMetrics, resetRateLimitBuckets } from '../../src/middleware/rateLimitMetrics';

// Mock logger to avoid console noise
jest.mock('../../src/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock env module
jest.mock('../../src/env', () => ({
  __esModule: true,
  default: {
    ADMIN_API_KEY: 'test-admin-key-12345678901234567890123456',
    NODE_ENV: 'test',
  },
}));

describe('Metrics Endpoint Security', () => {
  let app: Express;
  const validAdminKey = 'test-admin-key-12345678901234567890123456';

  // Reset rate limit state and mocks before each test
  beforeEach(() => {
    resetRateLimitBuckets();
    jest.clearAllMocks();
  });

  beforeEach(() => {
    app = express();

    // Mock metrics handler
    const metricsHandler = (_req: express.Request, res: express.Response) => {
      res.set('Content-Type', 'text/plain');
      res.send('# Metrics data\nmetric_name 123\n');
    };

    // Mount middleware and handler
    app.get('/metrics', requireMetricsAuth, rateLimitMetrics, metricsHandler);

    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should reject requests without credentials', async () => {
      const response = await request(app).get('/metrics').expect(401);

      expect(response.body).toEqual({
        error: 'missing_credentials',
        message: 'Admin API key required. Provide via x-api-key header or api_key query parameter.',
        code: 'MISSING_CREDENTIALS',
      });
    });

    it('should reject requests with invalid API key', async () => {
      const response = await request(app).get('/metrics').set('x-api-key', 'wrong-key').expect(403);

      expect(response.body).toEqual({
        error: 'invalid_credentials',
        message: 'Invalid admin API key',
        code: 'INVALID_CREDENTIALS',
      });
    });

    it('should accept requests with valid API key in header', async () => {
      const response = await request(app)
        .get('/metrics')
        .set('x-api-key', validAdminKey)
        .expect(200);

      expect(response.text).toContain('metric_name 123');
      expect(response.headers['content-type']).toContain('text/plain');
    });

    it('should accept requests with valid API key in query parameter', async () => {
      const response = await request(app)
        .get('/metrics')
        .query({ api_key: validAdminKey })
        .expect(200);

      expect(response.text).toContain('metric_name 123');
    });

    it('should prefer header over query parameter', async () => {
      const response = await request(app)
        .get('/metrics')
        .set('x-api-key', validAdminKey)
        .query({ api_key: 'wrong-key' })
        .expect(200);

      expect(response.text).toContain('metric_name 123');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      // Make 10 requests (within limit)
      const requests = Array(10)
        .fill(null)
        .map(() => request(app).get('/metrics').set('x-api-key', validAdminKey));

      const responses = await Promise.all(requests);

      // All should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });

    it('should block requests exceeding rate limit', async () => {
      // Make 11 requests (exceeds limit of 10)
      const requests = Array(11)
        .fill(null)
        .map(() => request(app).get('/metrics').set('x-api-key', validAdminKey));

      const responses = await Promise.all(requests);

      // First 10 should succeed, 11th should be rate limited
      const successCount = responses.filter((r) => r.status === 200).length;
      const rateLimitedCount = responses.filter((r) => r.status === 429).length;

      expect(successCount).toBe(10);
      expect(rateLimitedCount).toBe(1);

      const rateLimitedResponse = responses.find((r) => r.status === 429);
      expect(rateLimitedResponse?.body.error).toBe('RATE_LIMITED');
      expect(rateLimitedResponse?.headers['retry-after']).toBeDefined();
      expect(rateLimitedResponse?.body.limit).toBe(10);
      expect(rateLimitedResponse?.body.window).toBe('1 minute');
    });

    it('should include rate limit information in 429 response', async () => {
      // Exhaust rate limit
      await Promise.all(
        Array(10)
          .fill(null)
          .map(() => request(app).get('/metrics').set('x-api-key', validAdminKey)),
      );

      // Next request should be rate limited
      const response = await request(app)
        .get('/metrics')
        .set('x-api-key', validAdminKey)
        .expect(429);

      expect(response.body).toMatchObject({
        error: 'RATE_LIMITED',
        limit: 10,
        window: '1 minute',
      });
      expect(response.body.retryAfter).toBeGreaterThan(0);
      expect(response.body.message).toContain('retry');
    });
  });

  describe('Configuration', () => {
    it('should validate ADMIN_API_KEY is set', () => {
      // In production, ADMIN_API_KEY is validated at startup by env.ts
      // Here we verify the test environment is properly configured
      const envModule = require('../../src/env');
      expect(envModule.default.ADMIN_API_KEY).toBeDefined();
      expect(envModule.default.ADMIN_API_KEY.length).toBeGreaterThanOrEqual(32);
    });
  });

  describe('Prometheus Integration', () => {
    it('should return metrics in Prometheus format', async () => {
      const response = await request(app)
        .get('/metrics')
        .set('x-api-key', validAdminKey)
        .expect(200);

      // Check Prometheus format
      expect(response.text).toMatch(/^# /); // Comment line
      expect(response.text).toMatch(/\w+ \d+/); // metric_name value
    });

    it('should handle multiple scrapes within rate limit', async () => {
      // Simulate Prometheus scraping every 15 seconds (4 times per minute)
      const scrapes = Array(4)
        .fill(null)
        .map(() => request(app).get('/metrics').set('x-api-key', validAdminKey));

      const responses = await Promise.all(scrapes);

      // All scrapes should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.text).toContain('metric_name');
      });
    });
  });

  describe('Security Audit Trail', () => {
    it('should log successful access for audit', async () => {
      const { logger } = require('../../src/logger');

      await request(app).get('/metrics').set('x-api-key', validAdminKey).expect(200);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          ip: expect.any(String),
          path: '/metrics',
        }),
        'Metrics access granted',
      );
    });

    it('should log invalid access attempts', async () => {
      const { logger } = require('../../src/logger');

      await request(app).get('/metrics').set('x-api-key', 'wrong-key').expect(403);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          ip: expect.any(String),
          path: '/metrics',
        }),
        'Invalid admin API key attempt',
      );
    });

    it('should log missing credentials attempts', async () => {
      const { logger } = require('../../src/logger');

      await request(app).get('/metrics').expect(401);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          ip: expect.any(String),
          path: '/metrics',
        }),
        'Metrics access attempt without credentials',
      );
    });
  });
});

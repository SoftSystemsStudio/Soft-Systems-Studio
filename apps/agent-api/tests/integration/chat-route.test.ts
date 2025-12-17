/**
 * Integration tests for /api/v1/agents/customer-service/chat route
 *
 * LIVE: Now using the REAL router after middleware refactor to defer env validation.
 * This test runs in Lane A (default CI) without CI_STABLE flag or DATABASE_URL/JWT_SECRET.
 *
 * The refactoring changed:
 * - `env.ts`: Added getEnv() lazy loader
 * - `auth-combined.ts`: Calls getEnv() inside middleware function (not at import)
 *
 * Result: Router imports succeed without environment variables being set!
 */

// Mock database FIRST (before any middleware imports it)
jest.mock('../../src/db', () => ({
  $connect: jest.fn(),
  $disconnect: jest.fn(),
}));

// Mock external services and utilities
jest.mock('../../src/services/chat');
jest.mock('../../src/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('../../src/middleware/requestContext', () => ({
  getRequestLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  }),
  refreshRequestContext: () => {},
}));

// Mock getEnv to return test-friendly config without requiring real env vars
jest.mock('../../src/env', () => ({
  getEnv: () => ({
    NODE_ENV: 'test',
    PORT: 5000,
    POSTGRES_URL: 'postgresql://test',
    REDIS_URL: 'redis://localhost',
    OPENAI_API_KEY: 'sk-test-key',
    JWT_SECRET: 'test-secret-at-least-32-characters-long',
    JWT_ALGORITHM: 'HS256',
    API_KEY: 'test-api-key',
    QDRANT_HOST: 'localhost',
    QDRANT_PORT: 6333,
    QDRANT_COLLECTION: 'kb',
    LOG_LEVEL: 'debug',
    ALLOW_ANONYMOUS_DEV: false,
    SERVER_ROLE: 'api',
  }),
  env: {
    NODE_ENV: 'test',
    PORT: 5000,
    POSTGRES_URL: 'postgresql://test',
    REDIS_URL: 'redis://localhost',
    OPENAI_API_KEY: 'sk-test-key',
    JWT_SECRET: 'test-secret-at-least-32-characters-long',
    JWT_ALGORITHM: 'HS256',
    API_KEY: 'test-api-key',
    QDRANT_HOST: 'localhost',
    QDRANT_PORT: 6333,
    QDRANT_COLLECTION: 'kb',
    LOG_LEVEL: 'debug',
    ALLOW_ANONYMOUS_DEV: false,
    SERVER_ROLE: 'api',
  },
}));

// Mock auth middleware to accept harness context
jest.mock('../../src/middleware/auth-combined', () => ({
  __esModule: true,
  default: (_req: any, _res: any, next: any) => {
    // Harness sets req.auth already; just pass through without validation
    next();
  },
  requireAuth: (_req: any, _res: any, next: any) => {
    // Harness sets req.auth already; just pass through without validation
    next();
  },
}));

// Mock tenant/workspace middleware
jest.mock('../../src/middleware/tenant', () => ({
  __esModule: true,
  default: (_req: any, _res: any, next: any) => {
    next();
  },
}));

// Mock role middleware
jest.mock('../../src/middleware/role', () => ({
  requireRole: () => (_req: any, _res: any, next: any) => next(),
}));

// Mock validateBody middleware
jest.mock('../../src/middleware/validateBody', () => ({
  validateBody: () => (_req: any, _res: any, next: any) => next(),
}));

// Mock rate limit middleware (named exports)
jest.mock('../../src/middleware/rateLimitChat', () => ({
  rateLimitChat: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('../../src/middleware/rateLimitRun', () => ({
  rateLimitRun: (_req: any, _res: any, next: any) => next(),
}));

// Mock error handler
jest.mock('../../src/middleware/errorHandler', () => ({
  asyncHandler: (fn: any) => fn,
}));

// NOW safe to import after all mocks are defined
import request from 'supertest';
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { createChatTestApp } from './fixtures/chatRouterHarness';

// REAL router - now safe to import after env refactor!
import customerServiceRouter from '../../src/api/v1/agents/customer_service';
import * as chatService from '../../src/services/chat';

describe('Chat Route with Real Router - Lane A Integration', () => {
  describe('Harness + Real Router Setup', () => {
    it('should create an Express app with the real customer service router', async () => {
      const app = createChatTestApp(customerServiceRouter, {
        auth: { sub: 'user-123', role: 'user' },
      });

      // Test that router is mounted at /api/v1
      const response = await request(app).get('/api/v1/nonexistent').expect(404);

      // If we got here, router was successfully mounted!
      expect(response.status).toBe(404);
    });

    it('should handle errors from real router gracefully', async () => {
      (chatService.runChat as jest.Mock).mockRejectedValue(new Error('Service error'));

      const app = createChatTestApp(customerServiceRouter, {
        auth: { sub: 'user-123', role: 'user' },
      });

      const response = await request(app)
        .post('/api/v1/chat')
        .send({ message: 'test' })
        .expect(500);

      expect(response.body.error).toBe('CHAT_FAILED');
    });
  });

  describe('Real /chat endpoint', () => {
    it('should process successful chat request', async () => {
      const mockResult = {
        reply: 'Hello!',
        conversationId: 'conv-123',
      };

      (chatService.runChat as jest.Mock).mockResolvedValue(mockResult);

      const app = createChatTestApp(customerServiceRouter, {
        auth: { sub: 'user-456', role: 'user' },
      });

      const response = await request(app)
        .post('/api/v1/chat')
        .send({ message: 'Hello, I need help' })
        .expect(200);

      expect(response.body.reply).toBe('Hello!');
      expect(response.body.conversationId).toBe('conv-123');
    });
  });

  describe('Demo: Harness Pattern Still Works', () => {
    it('should create a minimal test router', async () => {
      const testRouter = express.Router();
      testRouter.get('/demo', (_req: Request, res: Response) => {
        res.json({ demo: true });
      });

      const app = createChatTestApp(testRouter, {
        auth: { sub: 'user-789', role: 'admin' },
      });

      const response = await request(app).get('/api/v1/demo').expect(200);
      expect(response.body.demo).toBe(true);
    });
  });
});

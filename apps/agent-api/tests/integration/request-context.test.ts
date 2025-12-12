/**
 * Tests for Request Context Propagation
 * Verifies that request IDs and auth context flow through logs and errors
 */
import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import { requestContext, getRequestContext, getRequestLogger } from '../../src/middleware/requestContext';
import { httpLogger } from '../../src/logger';
import { errorHandler } from '../../src/middleware/errorHandler';
import { refreshRequestContext } from '../../src/middleware/requestContext';

// Mock logger before imports
jest.mock('../../src/logger', () => {
  const mockLogger = {
    child: jest.fn().mockReturnThis(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
  
  return {
    logger: mockLogger,
    httpLogger: jest.fn((_req: any, _res: any, next: any) => {
      // Simulate pino-http setting request ID
      _req.id = `req-${Date.now()}`;
      next();
    }),
  };
});

jest.mock('../../src/env', () => ({
  __esModule: true,
  default: {
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret',
  },
}));

describe('Request Context Propagation', () => {
  let app: Express;
  let mockLogger: any;

  beforeEach(() => {
    // Get mocked logger instance
    mockLogger = require('../../src/logger').logger;
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    app.use(httpLogger as any);
    app.use(requestContext);
  });

  describe('Context Initialization', () => {
    it('should create request context with request ID', async () => {
      app.get('/test', (req: Request, res: Response) => {
        const context = getRequestContext(req);
        res.json({
          hasContext: !!context,
          requestId: context?.requestId,
          method: context?.method,
          path: context?.path,
        });
      });

      const response = await request(app).get('/test');
      
      expect(response.body.hasContext).toBe(true);
      expect(response.body.requestId).toMatch(/^req-/);
      expect(response.body.method).toBe('GET');
      expect(response.body.path).toBe('/test');
    });

    it('should attach child logger to request', async () => {
      app.get('/test', (req: Request, res: Response) => {
        const log = getRequestLogger(req);
        res.json({
          hasLogger: !!log,
        });
      });

      await request(app).get('/test');
      
      // Verify child logger was created
      expect(mockLogger.child).toHaveBeenCalled();
      const childCall = mockLogger.child.mock.calls[0][0];
      expect(childCall).toHaveProperty('requestId');
    });

    it('should include IP address in context', async () => {
      app.get('/test', (req: Request, res: Response) => {
        const context = getRequestContext(req);
        res.json({ ip: context?.ip });
      });

      const response = await request(app).get('/test');
      expect(response.body.ip).toBeDefined();
    });
  });

  describe('Authentication Context', () => {
    it('should include userId after authentication', async () => {
      app.use((req: Request, _res: Response, next: NextFunction) => {
        (req as any).auth = {
          sub: 'user-123',
          workspaceId: 'workspace-456',
        };
        refreshRequestContext(req);
        next();
      });

      app.get('/test', (req: Request, res: Response) => {
        const context = getRequestContext(req);
        res.json({
          userId: context?.userId,
          workspaceId: context?.workspaceId,
        });
      });

      const response = await request(app).get('/test');
      
      expect(response.body.userId).toBe('user-123');
      expect(response.body.workspaceId).toBe('workspace-456');
    });

    it('should include role information', async () => {
      app.use((req: Request, _res: Response, next: NextFunction) => {
        (req as any).auth = {
          sub: 'user-123',
          role: 'admin',
        };
        refreshRequestContext(req);
        next();
      });

      app.get('/test', (req: Request, res: Response) => {
        const context = getRequestContext(req);
        res.json({ role: context?.role });
      });

      const response = await request(app).get('/test');
      expect(response.body.role).toBe('admin');
    });

    it('should include API key context', async () => {
      app.use((req: Request, _res: Response, next: NextFunction) => {
        (req as any).auth = {
          apiKey: true,
          apiKeyId: 'api-key-789',
          role: 'service',
        };
        refreshRequestContext(req);
        next();
      });

      app.get('/test', (req: Request, res: Response) => {
        const context = getRequestContext(req);
        res.json({
          apiKeyId: context?.apiKeyId,
          role: context?.role,
        });
      });

      const response = await request(app).get('/test');
      expect(response.body.apiKeyId).toBe('api-key-789');
      expect(response.body.role).toBe('service');
    });

    it('should handle admin auth context', async () => {
      app.use((req: Request, _res: Response, next: NextFunction) => {
        (req as any).auth = {
          apiKeyId: 'admin',
          roles: ['admin'],
          role: 'admin',
        };
        refreshRequestContext(req);
        next();
      });

      app.get('/test', (req: Request, res: Response) => {
        const context = getRequestContext(req);
        res.json({
          role: context?.role,
          apiKeyId: context?.apiKeyId,
        });
      });

      const response = await request(app).get('/test');
      expect(response.body.role).toBe('admin');
      expect(response.body.apiKeyId).toBe('admin');
    });
  });

  describe('Logger Context Binding', () => {
    it('should create child logger with request ID', async () => {
      app.get('/test', (req: Request, res: Response) => {
        getRequestLogger(req);
        res.json({ success: true });
      });

      await request(app).get('/test');

      expect(mockLogger.child).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: expect.stringMatching(/^req-/),
        })
      );
    });

    it('should bind userId to logger after auth', async () => {
      app.use((req: Request, _res: Response, next: NextFunction) => {
        (req as any).auth = { sub: 'user-999' };
        refreshRequestContext(req);
        next();
      });

      app.get('/test', (req: Request, res: Response) => {
        getRequestLogger(req);
        res.json({ success: true });
      });

      await request(app).get('/test');

      // Should be called twice: once initially, once after auth
      expect(mockLogger.child).toHaveBeenCalledTimes(2);
      expect(mockLogger.child).toHaveBeenLastCalledWith(
        expect.objectContaining({
          userId: 'user-999',
        })
      );
    });

    it('should bind workspaceId to logger', async () => {
      app.use((req: Request, _res: Response, next: NextFunction) => {
        (req as any).auth = {
          sub: 'user-123',
          workspaceId: 'ws-abc',
        };
        refreshRequestContext(req);
        next();
      });

      app.get('/test', (req: Request, res: Response) => {
        getRequestLogger(req);
        res.json({ success: true });
      });

      await request(app).get('/test');

      expect(mockLogger.child).toHaveBeenLastCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          workspaceId: 'ws-abc',
        })
      );
    });

    it('should use bound logger for request logs', async () => {
      app.get('/test', (req: Request, res: Response) => {
        const log = getRequestLogger(req);
        log.info({ action: 'test' }, 'Test log message');
        res.json({ success: true });
      });

      await request(app).get('/test');

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'test' }),
        'Test log message'
      );
    });
  });

  describe('Error Handler Integration', () => {
    beforeEach(() => {
      app.use(errorHandler);
    });

    it('should include request context in error logs', async () => {
      app.use((req: Request, _res: Response, next: NextFunction) => {
        (req as any).auth = {
          sub: 'user-error-test',
          workspaceId: 'ws-error-test',
        };
        refreshRequestContext(req);
        next();
      });

      app.get('/test', (_req: Request, _res: Response) => {
        throw new Error('Test error');
      });

      await request(app).get('/test').expect(500);

      // Error handler should use bound logger
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should include requestId in error response context', async () => {
      app.get('/test', (_req: Request, _res: Response) => {
        throw new Error('Test error');
      });

      await request(app).get('/test').expect(500);

      // Verify error handler logged with context
      const errorLogCall = mockLogger.error.mock.calls[0];
      expect(errorLogCall).toBeDefined();
      expect(errorLogCall[0]).toHaveProperty('requestId');
    });

    it('should preserve context through async error handling', async () => {
      app.use((req: Request, _res: Response, next: NextFunction) => {
        (req as any).auth = { sub: 'async-user' };
        refreshRequestContext(req);
        next();
      });

      app.get('/test', async (_req: Request, _res: Response) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('Async error');
      });

      await request(app).get('/test').expect(500);

      const errorLogCall = mockLogger.error.mock.calls[0];
      expect(errorLogCall[0]).toMatchObject(
        expect.objectContaining({
          userId: 'async-user',
        })
      );
    });
  });

  describe('Context Immutability', () => {
    it('should not lose context across middleware', async () => {
      const contextSnapshots: any[] = [];

      app.use((_req: Request, _res: Response, next: NextFunction) => {
        contextSnapshots.push({ ...((_req as any).context || {}) });
        next();
      });

      app.use((req: Request, _res: Response, next: NextFunction) => {
        (req as any).auth = { sub: 'user-123' };
        refreshRequestContext(req);
        next();
      });

      app.use((_req: Request, _res: Response, next: NextFunction) => {
        contextSnapshots.push({ ...((_req as any).context || {}) });
        next();
      });

      app.get('/test', (req: Request, res: Response) => {
        contextSnapshots.push({ ...(req.context || {}) });
        res.json({ snapshots: contextSnapshots.length });
      });

      await request(app).get('/test');

      expect(contextSnapshots).toHaveLength(3);
      expect(contextSnapshots[0].requestId).toBeDefined();
      expect(contextSnapshots[2].userId).toBe('user-123');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing context gracefully', async () => {
      const appNoContext = express();
      // Skip requestContext middleware
      appNoContext.get('/test', (req: Request, res: Response) => {
        const context = getRequestContext(req);
        const log = getRequestLogger(req);
        res.json({
          hasContext: !!context,
          hasLogger: !!log,
        });
      });

      const response = await request(appNoContext).get('/test');
      expect(response.body.hasContext).toBe(false);
      expect(response.body.hasLogger).toBe(true); // Falls back to base logger
    });

    it('should handle refresh before context initialization', async () => {
      const appNoContext = express();
      appNoContext.use((req: Request, _res: Response, next: NextFunction) => {
        (req as any).auth = { sub: 'user-123' };
        refreshRequestContext(req); // Called before requestContext middleware
        next();
      });

      appNoContext.get('/test', (req: Request, res: Response) => {
        res.json({ context: getRequestContext(req) });
      });

      const response = await request(appNoContext).get('/test');
      expect(response.body.context).toBeUndefined();
    });

    it('should handle anonymous auth gracefully', async () => {
      app.use((req: Request, _res: Response, next: NextFunction) => {
        (req as any).auth = { anonymous: true };
        refreshRequestContext(req);
        next();
      });

      app.get('/test', (req: Request, res: Response) => {
        const context = getRequestContext(req);
        res.json({
          userId: context?.userId,
          hasRequestId: !!context?.requestId,
        });
      });

      const response = await request(app).get('/test');
      expect(response.body.userId).toBeUndefined();
      expect(response.body.hasRequestId).toBe(true);
    });
  });
});

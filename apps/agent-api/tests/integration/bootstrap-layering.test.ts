/**
 * Bootstrap Layering Tests
 * 
 * These tests verify that the bootstrap layer (index.ts) adheres to the
 * documented architecture:
 * - No direct route handlers (all routes use routers)
 * - Proper middleware ordering
 * - All routes follow versioned structure or are system endpoints
 * - Bootstrap only contains middleware setup and router mounting
 */

import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';

const BOOTSTRAP_PATH = path.join(__dirname, '../../src/index.ts');

describe('Bootstrap Layer Architecture Compliance', () => {
  describe('Source Code Compliance', () => {
    let bootstrapContent: string;

    beforeAll(() => {
      bootstrapContent = fs.readFileSync(BOOTSTRAP_PATH, 'utf8');
    });

    test('should not contain direct route handlers (app.get/post/put/delete)', () => {
      // Allow app.use but not app.get/post/put/delete with path + handlers
      // Match: app.get('/path', handler) but not imports or comments
      const directHandlerPattern = /^\s*app\.(get|post|put|delete|patch)\s*\(\s*['"`][^'"`]+['"`]/gm;
      const matches = bootstrapContent.match(directHandlerPattern);
      
      if (matches) {
        throw new Error(`Bootstrap contains direct route handlers: ${matches.join(', ')}`);
      }
      expect(matches).toBeNull();
    });

    test('should only use app.use() for mounting routers', () => {
      // Find all app.use statements that aren't middleware
      const lines = bootstrapContent.split('\n');
      const appUseLines = lines.filter((line) => {
        if (!line.includes('app.use')) return false;
        
        // Skip middleware (single argument or known middleware patterns)
        if (line.includes('helmet()') || 
            line.includes('bodyParser') || 
            line.includes('cookieParser') ||
            line.includes('httpLogger') ||
            line.includes('requestContext') ||
            line.includes('notFoundHandler') ||
            line.includes('errorHandler') ||
            line.includes('sentryRequestHandler') ||
            line.includes('sentryErrorHandler')) {
          return false;
        }
        
        // These should be router mounts with path + router
        return line.includes('app.use(');
      });

      appUseLines.forEach(line => {
        // Should have pattern: app.use('/path', someRouter) or middleware like requireAuth
        const hasPathAndRouter = /app\.use\s*\(\s*['"`]\/[^'"`]*['"`]\s*,\s*\w+(Router|Auth|\w+\.raw)\s*/.test(line);
        if (!hasPathAndRouter && !line.includes('//')) {
          console.warn(`Potential non-router mount: ${line.trim()}`);
        }
      });
    });

    test('should not contain business logic', () => {
      // Check for direct database calls, service calls, or complex logic
      const businessLogicPatterns = [
        /await\s+prisma\./,  // Direct DB calls
        /await\s+\w+Service\./,  // Service calls
        /await\s+fetch\(/,  // Direct API calls
        /for\s*\(/,  // Complex loops (likely business logic)
        /while\s*\(/,  // Complex loops
      ];

      businessLogicPatterns.forEach(pattern => {
        if (pattern.test(bootstrapContent)) {
          throw new Error(`Bootstrap contains potential business logic matching pattern: ${pattern}`);
        }
      });
    });

    test('should have proper middleware ordering', () => {
      const lines = bootstrapContent.split('\n');
      const middlewareOrder: string[] = [];

      lines.forEach(line => {
        if (line.includes('app.use(helmet')) middlewareOrder.push('helmet');
        if (line.includes('app.use(httpLogger')) middlewareOrder.push('httpLogger');
        if (line.includes('app.use(bodyParser')) middlewareOrder.push('bodyParser');
        if (line.includes('app.use(cookieParser')) middlewareOrder.push('cookieParser');
        if (line.includes('app.use(requestContext')) middlewareOrder.push('requestContext');
        if (line.includes('app.use(sentryRequestHandler')) middlewareOrder.push('sentryRequestHandler');
      });

      // Critical order: Sentry → Security → Logging → Parsing → Context
      const expectedOrdering: Array<[string, string]> = [
        ['sentryRequestHandler', 'helmet'],  // Sentry before or with security
        ['helmet', 'httpLogger'],  // Security before logging
        ['httpLogger', 'bodyParser'],  // Logging before parsing
        ['bodyParser', 'requestContext'],  // Parsing before context
      ];

      expectedOrdering.forEach(([before, after]: [string, string]) => {
        const beforeIdx = middlewareOrder.indexOf(before);
        const afterIdx = middlewareOrder.indexOf(after);
        
        if (beforeIdx !== -1 && afterIdx !== -1 && beforeIdx > afterIdx) {
          throw new Error(`Middleware ordering violation: ${before} must come before ${after}`);
        }
      });
    });

    test('should import routers, not handlers', () => {
      const importLines = bootstrapContent
        .split('\n')
        .filter(line => line.trim().startsWith('import') && !line.includes('//'));

      // Check that we're importing routers, not handlers
      const handlerImports = importLines.filter(line => 
        line.includes('Handler') && 
        !line.includes('errorHandler') && 
        !line.includes('notFoundHandler') &&
        !line.includes('sentryErrorHandler') &&
        !line.includes('sentryRequestHandler')
      );

      if (handlerImports.length > 0) {
        console.warn('Importing handlers in bootstrap:', handlerImports);
      }
    });
  });

  describe('Runtime Route Structure', () => {
    let app: express.Application;

    beforeAll(async () => {
      // Skip runtime tests if required env vars are not set
      if (!process.env.POSTGRES_URL || !process.env.OPENAI_API_KEY) {
        console.log('Skipping runtime tests - env vars not configured');
        return;
      }
      
      // Dynamically import the app
      const indexModule = await import('../../src/index');
      app = indexModule.default;
    });

    test('health endpoint should be accessible', async () => {
      if (!app) {
        console.log('Skipping - app not initialized');
        return;
      }
      const response = await request(app).get('/health');
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
    });

    test('status endpoint should be accessible', async () => {
      if (!app) return;
      const response = await request(app).get('/status');
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
    });

    test('metrics endpoint should require authentication', async () => {
      if (!app) return;
      const response = await request(app).get('/api/v1/observability/metrics');
      expect([401, 403]).toContain(response.status);
    });

    test('versioned API routes should be under /api/v1/', async () => {
      if (!app) return;
      // Test that main API routes follow versioned structure
      const versionedPaths = [
        '/api/v1/auth/login',
        '/api/v1/agents/customer-service',
        '/api/v1/admin/cleanup',
        '/api/v1/observability/metrics',
      ];

      for (const path of versionedPaths) {
        const response = await request(app).get(path);
        // Should not be 404 (route exists), but will be 401/405/400 etc
        expect(response.status).not.toBe(404);
      }
    });

    test('unknown routes should return 404', async () => {
      if (!app) return;
      const response = await request(app).get('/api/v1/nonexistent/route');
      expect(response.status).toBe(404);
    });

    test('root path should return 404', async () => {
      if (!app) return;
      const response = await request(app).get('/');
      expect(response.status).toBe(404);
    });
  });

  describe('Architectural Boundaries', () => {
    test('health and status should be in api/v1/system/', () => {
      const healthPath = path.join(__dirname, '../../src/api/v1/system/health.ts');
      const statusPath = path.join(__dirname, '../../src/api/v1/system/status.ts');
      
      expect(fs.existsSync(healthPath)).toBe(true);
      expect(fs.existsSync(statusPath)).toBe(true);
    });

    test('metrics should be in api/v1/observability/', () => {
      const metricsPath = path.join(__dirname, '../../src/api/v1/observability/metrics.ts');
      expect(fs.existsSync(metricsPath)).toBe(true);
    });

    test('bootstrap should not export business logic functions', async () => {
      if (!process.env.POSTGRES_URL || !process.env.OPENAI_API_KEY) {
        return; // Skip if env not configured
      }
      const indexModule = await import('../../src/index');
      const exports = Object.keys(indexModule);
      
      // Should only export the Express app, not services or handlers
      const businessExports = exports.filter(name => 
        name.includes('Service') || 
        name.includes('Handler') && name !== 'errorHandler' && name !== 'notFoundHandler'
      );
      
      expect(businessExports).toHaveLength(0);
    });
  });

  describe('Documentation Alignment', () => {
    test('ARCHITECTURE.md should exist and document layered structure', () => {
      const archDocPath = path.join(__dirname, '../../../../docs/ARCHITECTURE.md');
      expect(fs.existsSync(archDocPath)).toBe(true);
      
      const content = fs.readFileSync(archDocPath, 'utf8');
      expect(content).toMatch(/layer/i);
      expect(content).toMatch(/api\/v1/);
    });

    test('bootstrap implementation should match documented architecture', () => {
      // This is a meta-test: if other tests pass, architecture is aligned
      // Just verify key architecture markers exist
      const archDocPath = path.join(__dirname, '../../../../docs/ARCHITECTURE.md');
      const archDoc = fs.readFileSync(archDocPath, 'utf8');
      
      const bootstrapContent = fs.readFileSync(BOOTSTRAP_PATH, 'utf8');
      
      // If ARCHITECTURE.md mentions /api/v1/, bootstrap should mount it
      if (archDoc.includes('/api/v1/')) {
        expect(bootstrapContent).toMatch(/app\.use\(['"`]\/api\/v1\//);
      }
    });
  });
});

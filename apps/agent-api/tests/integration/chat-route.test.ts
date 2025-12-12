/**
 * Integration tests for /api/v1/agents/customer-service/chat route
 *
 * NOTE: These tests require a running database and env vars to be set.
 * To run: ensure DATABASE_URL, OPENAI_API_KEY, and JWT_SECRET are set.
 */
import request from 'supertest';
import app from '../../src/index';
import * as chatService from '../../src/services/chat';

// Mock the chat service to avoid real LLM/vector DB calls
jest.mock('../../src/services/chat');

// Mock logger
jest.mock('../../src/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}));

// Skip integration tests if env vars not available
const skipIntegration = !process.env.DATABASE_URL || !process.env.OPENAI_API_KEY;

describe.skip('POST /api/v1/agents/customer-service/chat', () => {
  const validToken = 'test-jwt-token';
  const workspaceId = 'ws-test-123';
  const userId = 'user-test-456';

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock auth middleware by setting req.auth
    // In real tests, you'd want to use actual JWT tokens
    app.use((req, _res, next) => {
      if (req.headers.authorization === `Bearer ${validToken}`) {
        (req as any).auth = { workspaceId, userId };
        (req as any).authPrincipal = { userId, workspaceId, roles: ['user'] };
      }
      next();
    });
  });

  describe('successful requests', () => {
    it('should process chat message and return reply', async () => {
      const mockResult = {
        reply: 'Hello! How can I assist you?',
        conversationId: 'conv-abc-123',
        messageIds: ['msg-1', 'msg-2'],
      };

      (chatService.runChat as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/agents/customer-service/chat')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          message: 'Hello, I need help with my account',
        })
        .expect(200);

      expect(response.body).toEqual({
        reply: mockResult.reply,
        conversationId: mockResult.conversationId,
      });
    });

    it('should accept conversation ID for continuing conversation', async () => {
      const mockResult = {
        reply: 'Sure, I can help with that.',
        conversationId: 'conv-existing-123',
        messageIds: ['msg-3', 'msg-4'],
      };

      (chatService.runChat as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/agents/customer-service/chat')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          message: 'Can you provide more details?',
          conversationId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        })
        .expect(200);

      expect(response.body.conversationId).toBe(mockResult.conversationId);
    });
  });

  describe('authentication and authorization', () => {
    it('should reject requests without authentication', async () => {
      await request(app)
        .post('/api/v1/agents/customer-service/chat')
        .send({
          message: 'Hello',
        })
        .expect(401);

      expect(chatService.runChat).not.toHaveBeenCalled();
    });

    it('should reject requests without workspace context', async () => {
      // Mock auth without workspace
      const appNoWorkspace = app;
      appNoWorkspace.use((req, _res, next) => {
        if (req.headers.authorization === 'Bearer no-workspace-token') {
          (req as any).auth = { userId: 'user-123' };
        }
        next();
      });

      const response = await request(appNoWorkspace)
        .post('/api/v1/agents/customer-service/chat')
        .set('Authorization', 'Bearer no-workspace-token')
        .send({
          message: 'Hello',
        })
        .expect(401);

      expect(response.body.error).toBe('workspace_required');
    });
  });

  describe('input validation', () => {
    it('should reject empty message', async () => {
      const response = await request(app)
        .post('/api/v1/agents/customer-service/chat')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          message: '',
        })
        .expect(400);

      expect(response.body.error).toBe('validation_error');
    });

    it('should reject message that is too long', async () => {
      const longMessage = 'a'.repeat(10001);

      const response = await request(app)
        .post('/api/v1/agents/customer-service/chat')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          message: longMessage,
        })
        .expect(400);

      expect(response.body.error).toBe('validation_error');
    });

    it('should reject invalid conversation ID format', async () => {
      const response = await request(app)
        .post('/api/v1/agents/customer-service/chat')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          message: 'Hello',
          conversationId: 'not-a-uuid',
        })
        .expect(400);

      expect(response.body.error).toBe('validation_error');
    });

    it('should reject missing message field', async () => {
      const response = await request(app)
        .post('/api/v1/agents/customer-service/chat')
        .set('Authorization', `Bearer ${validToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('validation_error');
    });
  });

  describe('rate limiting', () => {
    it('should enforce rate limits', async () => {
      const mockResult = {
        reply: 'Response',
        conversationId: 'conv-123',
        messageIds: ['msg-1', 'msg-2'],
      };

      (chatService.runChat as jest.Mock).mockResolvedValue(mockResult);

      // Make multiple requests to trigger rate limit
      const requests = Array(31)
        .fill(null)
        .map(() =>
          request(app)
            .post('/api/v1/agents/customer-service/chat')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ message: 'Test' }),
        );

      const responses = await Promise.all(requests);

      // First 30 should succeed, 31st should be rate limited
      const successCount = responses.filter((r) => r.status === 200).length;
      const rateLimitedCount = responses.filter((r) => r.status === 429).length;

      expect(successCount).toBe(30);
      expect(rateLimitedCount).toBe(1);

      const rateLimitedResponse = responses.find((r) => r.status === 429);
      expect(rateLimitedResponse?.body.error).toBe('RATE_LIMITED');
      expect(rateLimitedResponse?.headers['retry-after']).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should return 500 if chat service fails', async () => {
      (chatService.runChat as jest.Mock).mockRejectedValue(new Error('Service unavailable'));

      const response = await request(app)
        .post('/api/v1/agents/customer-service/chat')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          message: 'Hello',
        })
        .expect(500);

      expect(response.body.error).toBe('CHAT_FAILED');
    });
  });
});

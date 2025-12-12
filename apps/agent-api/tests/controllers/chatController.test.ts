/**
 * Tests for chat controller
 */
import request from 'supertest';
import express, { Express } from 'express';
import { chatController } from '../../src/controllers/chatController';
import * as chatService from '../../src/services/chat';

// Mock the chat service
jest.mock('../../src/services/chat');

// Mock logger to avoid console noise
jest.mock('../../src/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('chatController', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Simulate auth middleware - attach auth context
    app.use((req, _res, next) => {
      (req as any).auth = {
        workspaceId: 'ws-test-123',
        userId: 'user-test-456',
      };
      next();
    });

    // Mount controller
    app.post('/chat', chatController);

    // Clear mocks
    jest.clearAllMocks();
  });

  describe('successful chat flow', () => {
    it('should return chat response with conversation ID', async () => {
      const mockResult = {
        reply: 'Hello! How can I help you today?',
        conversationId: 'conv-123',
        messageIds: ['msg-1', 'msg-2'],
      };

      (chatService.runChat as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/chat')
        .send({
          message: 'Hello, I need help',
        })
        .expect(200);

      expect(response.body).toEqual({
        reply: mockResult.reply,
        conversationId: mockResult.conversationId,
      });

      expect(chatService.runChat).toHaveBeenCalledWith({
        workspaceId: 'ws-test-123',
        message: 'Hello, I need help',
        userId: 'user-test-456',
        conversationId: undefined,
      });
    });

    it('should handle existing conversation ID', async () => {
      const mockResult = {
        reply: 'Sure, I can help with that.',
        conversationId: 'conv-existing',
        messageIds: ['msg-3', 'msg-4'],
      };

      (chatService.runChat as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/chat')
        .send({
          message: 'Can you clarify?',
          conversationId: 'conv-existing',
        })
        .expect(200);

      expect(response.body).toEqual({
        reply: mockResult.reply,
        conversationId: mockResult.conversationId,
      });

      expect(chatService.runChat).toHaveBeenCalledWith({
        workspaceId: 'ws-test-123',
        message: 'Can you clarify?',
        userId: 'user-test-456',
        conversationId: 'conv-existing',
      });
    });
  });

  describe('error handling', () => {
    it('should return 401 if workspace context is missing', async () => {
      const appNoAuth = express();
      appNoAuth.use(express.json());
      appNoAuth.post('/chat', chatController);

      const response = await request(appNoAuth)
        .post('/chat')
        .send({
          message: 'Hello',
        })
        .expect(401);

      expect(response.body).toEqual({
        error: 'workspace_required',
        message: 'Workspace context is required for chat operations',
      });

      expect(chatService.runChat).not.toHaveBeenCalled();
    });

    it('should return 500 if chat service fails', async () => {
      const error = new Error('Database connection failed');
      (chatService.runChat as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .post('/chat')
        .send({
          message: 'Hello',
        })
        .expect(500);

      expect(response.body).toEqual({
        error: 'CHAT_FAILED',
        message: 'Database connection failed',
      });
    });

    it('should handle non-Error exceptions', async () => {
      (chatService.runChat as jest.Mock).mockRejectedValue('String error');

      const response = await request(app)
        .post('/chat')
        .send({
          message: 'Hello',
        })
        .expect(500);

      expect(response.body).toEqual({
        error: 'CHAT_FAILED',
        message: 'Failed to process chat request',
      });
    });
  });

  describe('request validation', () => {
    it('should accept valid chat request', async () => {
      const mockResult = {
        reply: 'Response',
        conversationId: 'conv-123',
        messageIds: ['msg-1', 'msg-2'],
      };

      (chatService.runChat as jest.Mock).mockResolvedValue(mockResult);

      await request(app)
        .post('/chat')
        .send({
          message: 'Test message',
          conversationId: '123e4567-e89b-12d3-a456-426614174000',
        })
        .expect(200);
    });
  });

  describe('workspace isolation', () => {
    it('should pass workspace ID from auth context', async () => {
      const mockResult = {
        reply: 'Response',
        conversationId: 'conv-123',
        messageIds: ['msg-1', 'msg-2'],
      };

      (chatService.runChat as jest.Mock).mockResolvedValue(mockResult);

      // Create app with different workspace
      const appWorkspace2 = express();
      appWorkspace2.use(express.json());
      appWorkspace2.use((req, _res, next) => {
        (req as any).auth = {
          workspaceId: 'ws-different-workspace',
          userId: 'user-123',
        };
        next();
      });
      appWorkspace2.post('/chat', chatController);

      await request(appWorkspace2)
        .post('/chat')
        .send({
          message: 'Hello',
        })
        .expect(200);

      expect(chatService.runChat).toHaveBeenCalledWith({
        workspaceId: 'ws-different-workspace',
        message: 'Hello',
        userId: 'user-123',
        conversationId: undefined,
      });
    });
  });
});

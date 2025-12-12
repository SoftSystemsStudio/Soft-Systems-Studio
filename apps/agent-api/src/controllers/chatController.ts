/**
 * Chat Controller
 * Handles chat endpoint logic with RAG retrieval and conversation persistence
 */
import type { Request, Response } from 'express';
import type { ChatRequest } from '../schemas/chat';
import { logger } from '../logger';
import { runChat } from '../services/chat';

/**
 * Extended request type with auth context
 */
interface AuthRequest extends Request {
  auth?: {
    workspaceId?: string;
    userId?: string;
  };
  validatedBody?: ChatRequest;
}

/**
 * Chat controller - handles customer service chat with RAG retrieval
 * Expects authentication and workspace context from middleware
 */
export async function chatController(req: Request, res: Response) {
  const authReq = req as AuthRequest;

  // Get validated body from middleware or fallback to req.body
  const payload = authReq.validatedBody ?? (authReq.body as ChatRequest);
  const workspaceId = authReq.auth?.workspaceId;
  const userId = authReq.auth?.userId;

  // This should never happen due to requireWorkspace middleware, but TypeScript needs it
  if (!workspaceId) {
    return res.status(401).json({
      error: 'workspace_required',
      message: 'Workspace context is required for chat operations',
    });
  }

  try {
    logger.info(
      {
        workspaceId,
        userId,
        messageLength: payload.message.length,
        hasConversationId: !!payload.conversationId,
      },
      'Chat request received',
    );

    // Run chat with RAG retrieval and persistence
    const result = await runChat({
      workspaceId,
      message: payload.message,
      userId,
      conversationId: payload.conversationId,
    });

    logger.info(
      {
        workspaceId,
        conversationId: result.conversationId,
        messageIds: result.messageIds,
      },
      'Chat completed successfully',
    );

    // Return reply with conversation context
    return res.status(200).json({
      reply: result.reply,
      conversationId: result.conversationId,
    });
  } catch (err) {
    logger.error(
      {
        err,
        workspaceId,
        userId,
      },
      'Chat controller failed',
    );

    return res.status(500).json({
      error: 'CHAT_FAILED',
      message: err instanceof Error ? err.message : 'Failed to process chat request',
    });
  }
}

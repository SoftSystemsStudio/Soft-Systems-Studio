/**
 * Public Chat Controller
 * Handles unauthenticated chat for website visitors
 * Rate limited by IP address instead of workspace
 */
import type { Request, Response } from 'express';
import { logger } from '../logger';
import { runChatSimple } from '../services/chat';

export interface PublicChatRequest {
  message: string;
  conversationId?: string; // Optional for multi-turn conversations
}

/**
 * Public chat controller - no authentication required
 * Uses demo workspace for knowledge base access
 */
export async function publicChatController(req: Request, res: Response) {
  const { message, conversationId } = req.body as PublicChatRequest;

  // Get client IP for logging
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  try {
    logger.info(
      {
        messageLength: message?.length,
        hasConversationId: !!conversationId,
        clientIp,
      },
      'Public chat request received',
    );

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Message is required and must be a non-empty string',
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        error: 'MESSAGE_TOO_LONG',
        message: 'Message must be less than 2000 characters',
      });
    }

    // Use demo workspace for public chat
    // This gives access to the knowledge base without requiring authentication
    const result = await runChatSimple({
      workspaceId: 'demo',
      message: message.trim(),
    });

    logger.info(
      {
        replyLength: result.reply.length,
        clientIp,
      },
      'Public chat completed successfully',
    );

    // Return reply without conversation tracking for public users
    return res.status(200).json({
      reply: result.reply,
      // Note: We don't return conversationId for public users
      // to keep it stateless and prevent abuse
    });
  } catch (err) {
    logger.error(
      {
        err,
        clientIp,
      },
      'Public chat controller failed',
    );

    return res.status(500).json({
      error: 'CHAT_FAILED',
      message: 'Failed to process your message. Please try again.',
    });
  }
}

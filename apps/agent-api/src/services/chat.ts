/**
 * Chat Service
 * Handles chat operations with transactional persistence
 */
import prisma from '../db';
import { logger } from '../logger';
import { querySimilar } from './qdrant';
import { chat as llmChat } from './llm';

export interface ChatInput {
  workspaceId: string;
  message: string;
  userId?: string;
  conversationId?: string;
}

export interface ChatResult {
  reply: string;
  conversationId: string;
  messageIds: string[];
}

/**
 * Run a chat with RAG retrieval and persist the conversation
 * Uses a transaction to ensure atomic persistence
 *
 * @throws Error if persistence fails - caller should handle appropriately
 */
export async function runChat(input: ChatInput): Promise<ChatResult> {
  const { workspaceId, message, conversationId: existingConversationId } = input;

  logger.info({ workspaceId, messageLength: message.length }, 'Starting chat');

  // Step 1: Retrieve relevant context from vector store (tenant-isolated)
  type SimilarItem = { id: string; score: number; payload?: { text?: string } };
  const contexts = (await querySimilar(workspaceId, message, 4)) as SimilarItem[];
  const contextText = contexts
    .map((c, idx) => `Context ${idx + 1}: ${c.payload?.text || ''}`)
    .join('\n\n');

  logger.debug({ workspaceId, contextCount: contexts.length }, 'Retrieved context');

  // Step 2: Generate response using LLM
  const system = `You are a helpful customer support assistant. Use the context to answer user questions. If you cannot answer, ask a clarification.`;
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: system },
    { role: 'user', content: `Context:\n${contextText}\n\nUser: ${message}` },
  ];

  const reply = await llmChat(messages);

  logger.debug({ workspaceId, replyLength: reply.length }, 'Generated reply');

  // Step 3: Persist conversation and messages in a transaction
  // This ensures either both records are created or neither is
  const result = await prisma.$transaction(async (tx) => {
    // Create or use existing conversation
    let conversationId: string;
    if (existingConversationId) {
      // Verify conversation exists and belongs to workspace
      const existing = await tx.conversation.findFirst({
        where: { id: existingConversationId, workspaceId },
      });
      if (!existing) {
        throw new Error(`Conversation ${existingConversationId} not found in workspace ${workspaceId}`);
      }
      conversationId = existing.id;
    } else {
      const conversation = await tx.conversation.create({
        data: { workspaceId },
      });
      conversationId = conversation.id;
    }

    // Create messages atomically
    const userMessage = await tx.message.create({
      data: {
        conversationId,
        role: 'user',
        content: message,
      },
    });

    const assistantMessage = await tx.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: reply,
      },
    });

    return {
      conversationId,
      messageIds: [userMessage.id, assistantMessage.id],
    };
  });

  logger.info(
    {
      workspaceId,
      conversationId: result.conversationId,
      messageCount: result.messageIds.length,
    },
    'Chat completed and persisted',
  );

  return {
    reply,
    conversationId: result.conversationId,
    messageIds: result.messageIds,
  };
}

/**
 * Simple chat without persistence (for external handlers like handleChat)
 * Returns just the reply without creating database records
 */
export async function runChatSimple(input: {
  workspaceId: string;
  message: string;
}): Promise<{ reply: string }> {
  const { workspaceId, message } = input;

  // Retrieve context
  type SimilarItem = { id: string; score: number; payload?: { text?: string } };
  const contexts = (await querySimilar(workspaceId, message, 4)) as SimilarItem[];
  const contextText = contexts
    .map((c, idx) => `Context ${idx + 1}: ${c.payload?.text || ''}`)
    .join('\n\n');

  // Generate response
  const system = `You are a helpful customer support assistant. Use the context to answer user questions. If you cannot answer, ask a clarification.`;
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: system },
    { role: 'user', content: `Context:\n${contextText}\n\nUser: ${message}` },
  ];

  const reply = await llmChat(messages);

  return { reply };
}

/**
 * Persist a chat exchange (user message + assistant reply) in a transaction
 * Use this when you've already generated the reply externally
 *
 * @throws Error if persistence fails
 */
export async function persistChatExchange(input: {
  workspaceId: string;
  userMessage: string;
  assistantReply: string;
  conversationId?: string;
}): Promise<{ conversationId: string; messageIds: string[] }> {
  const { workspaceId, userMessage, assistantReply, conversationId: existingConversationId } = input;

  const result = await prisma.$transaction(async (tx) => {
    let conversationId: string;

    if (existingConversationId) {
      // Verify conversation exists and belongs to workspace
      const existing = await tx.conversation.findFirst({
        where: { id: existingConversationId, workspaceId },
      });
      if (!existing) {
        throw new Error(`Conversation ${existingConversationId} not found in workspace ${workspaceId}`);
      }
      conversationId = existing.id;
    } else {
      const conversation = await tx.conversation.create({
        data: { workspaceId },
      });
      conversationId = conversation.id;
    }

    const userMsg = await tx.message.create({
      data: { conversationId, role: 'user', content: userMessage },
    });

    const assistantMsg = await tx.message.create({
      data: { conversationId, role: 'assistant', content: assistantReply },
    });

    return {
      conversationId,
      messageIds: [userMsg.id, assistantMsg.id],
    };
  });

  logger.info(
    { workspaceId, conversationId: result.conversationId },
    'Chat exchange persisted',
  );

  return result;
}

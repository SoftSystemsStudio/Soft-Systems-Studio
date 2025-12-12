/**
 * Public API Routes
 * Endpoints that don't require authentication
 */
import { Router } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { rateLimitPublicChat } from '../../middleware/rateLimitPublicChat';
import { publicChatController } from '../../controllers/publicChatController';

const router = Router();

/**
 * Public chat endpoint for website visitors
 * POST /api/v1/public/chat
 *
 * No authentication required
 * Rate limited by IP (10 req/min)
 */
router.post('/chat', rateLimitPublicChat, asyncHandler(publicChatController));

export default router;

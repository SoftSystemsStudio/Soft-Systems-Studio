/**
 * Public API Routes
 * Endpoints that don't require authentication
 */
import { Router } from 'express';
import { publicChatController } from '../../controllers/publicChatController';
import { publicVoiceController } from '../../controllers/publicVoiceController';
import { publicTtsController } from '../../controllers/publicTtsController';

const router = Router();

/**
 * Public chat endpoint for website visitors
 * POST /api/v1/public/chat
 *
 * No authentication required
 * Rate limited by IP (10 req/min)
 */
router.post('/chat', publicChatController);

/**
 * Public voice endpoint for Twilio
 * POST /api/v1/public/voice
 */
router.post('/voice', publicVoiceController);
router.get('/tts', publicTtsController);

export default router;

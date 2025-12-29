
import type { Request, Response } from 'express';
import { generateSpeech } from '../services/tts';
import { logger } from '../logger';

/**
 * Handle TTS requests
 * GET /api/v1/public/tts?text=...
 * Returns audio/mpeg
 */
export async function publicTtsController(req: Request, res: Response) {
    const text = req.query.text as string;

    if (!text) {
        res.status(400).send('Missing text parameter');
        return;
    }

    try {
        const audioBuffer = await generateSpeech(text);

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
        });

        res.send(audioBuffer);
    } catch (error: any) {
        logger.error({ error, text }, 'TTS Controller failed');
        res.status(500).send(`TTS Generation Failed: ${error.message}`);
    }
}

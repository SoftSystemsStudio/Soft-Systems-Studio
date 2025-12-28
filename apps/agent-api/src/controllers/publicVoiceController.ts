/**
 * Public Voice Controller
 * Handles incoming voice calls from Twilio with AI interaction
 */
import type { Request, Response } from 'express';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { logger } from '../logger';
import { runChat } from '../services/chat';

/**
 * Handle incoming voice call
 * POST /api/v1/public/voice
 */
export async function publicVoiceController(req: Request, res: Response) {
    const { CallSid, From, To, SpeechResult } = req.body;
    const conversationId = req.query.conversationId as string | undefined;
    let nextConversationId = conversationId;

    logger.info(
        { CallSid, From, To, hasSpeech: !!SpeechResult, conversationId },
        'Voice request received'
    );

    const twiml = new VoiceResponse();
    let aiReply = "Hello! I'm the AI receptionist for Soft Systems Studio. How can I help you today?";

    try {
        // If the user spoke, get a real AI response
        if (SpeechResult) {
            const result = await runChat({
                workspaceId: 'demo', // Using demo workspace for public access
                message: SpeechResult,
                userId: From || 'anonymous_voice', // Track by phone number
                conversationId,
            });

            aiReply = result.reply;
            nextConversationId = result.conversationId;
        }

        // Generate TwiML
        // <Gather> captures speech input
        const gather = twiml.gather({
            input: ['speech'],
            action: `/api/v1/public/voice?conversationId=${nextConversationId || ''}`,
            method: 'POST',
            timeout: 2, // Wait 2s silence before processing
            language: 'en-US',
        });

        gather.say({ voice: 'alice' }, aiReply);

        // If the user doesn't say anything, ask again or end call?
        // Usually good to loop once or twice.
        twiml.say({ voice: 'alice' }, "I didn't hear anything. Please stay on the line.");

    } catch (error) {
        logger.error({ error, CallSid }, 'Voice controller failed');
        twiml.say({ voice: 'alice' }, "I'm sorry, I'm having trouble connecting to the brain. Please try again later.");
    }

    res.type('text/xml');
    res.send(twiml.toString());
}

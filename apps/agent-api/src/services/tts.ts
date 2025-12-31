import fetch from 'node-fetch';
import { logger } from '../logger';
import path from 'path';
import dotenv from 'dotenv';

// Fail-safe: Load root .env if key is missing (e.g. if start.ts didn't run or context lost)
if (!process.env.ELEVENLABS_API_KEY) {
  const envPath = path.resolve(__dirname, '../../../../.env');
  logger.info({ envPath, cwd: process.cwd() }, 'Attempting to load .env manually');
  dotenv.config({ path: envPath });
}

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID_EN = process.env.ELEVENLABS_VOICE_ID_EN || '21m00Tcm4TlvDq8ikWAM'; // Rachel

/**
 * Generate speech from text using ElevenLabs API
 * Returns a Buffer of the MP3 audio
 */
export async function generateSpeech(text: string): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) {
    logger.error({ env: process.env }, 'ELEVENLABS_API_KEY is missing in generateSpeech');
    throw new Error('ELEVENLABS_API_KEY is missing from process.env');
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID_EN}`;

  logger.info(
    {
      voiceId: VOICE_ID_EN,
      modelId: 'eleven_turbo_v2_5',
      keyLength: ELEVENLABS_API_KEY.length,
    },
    'Generating speech via ElevenLabs',
  );

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5', // Newer turbo model
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error({ status: response.status, body: errorBody }, 'ElevenLabs API error');
    throw new Error(`ElevenLabs API failed: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

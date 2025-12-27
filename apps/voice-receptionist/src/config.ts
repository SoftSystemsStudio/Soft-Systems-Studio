import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';

const businessHoursSchema = z.record(z.array(z.tuple([z.string(), z.string()])));

// Load .env from likely locations to avoid cwd issues in Codespaces / persisted terminals
const candidateEnvPaths = [
  path.resolve(process.cwd(), 'apps/voice-receptionist/.env'),
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', '..', '.env'),
];

for (const p of candidateEnvPaths) {
  try {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      break;
    }
  } catch (e) {
    // ignore and try next
  }
}

const envSchema = z.object({
  PORT: z.string().default('8080').transform(Number),
  PUBLIC_BASE_URL: z.string().url(),
  WS_URL: z.string().url(),
  TWILIO_AUTH_TOKEN: z.string(),
  OPENAI_API_KEY: z.string(),
  N8N_INTAKE_WEBHOOK_URL: z.string().url(),
  N8N_SCHEDULING_WEBHOOK_URL: z.string().url(),
  N8N_ESCALATION_WEBHOOK_URL: z.string().url(),
  MIDWIFERY_TIMEZONE: z.string().default('America/Chicago'),
  MIDWIFERY_HOURS_JSON: z.string().transform((str) => {
    try {
      const parsed = JSON.parse(str) as unknown;
      return businessHoursSchema.parse(parsed);
    } catch (e) {
      throw new Error('Invalid JSON for MIDWIFERY_HOURS_JSON');
    }
  }),
  ELEVENLABS_VOICE_ID_EN: z.string().default('21m00Tcm4TlvDq8ikWAM'), // Default Rachel
  ELEVENLABS_VOICE_ID_ES: z.string().default('21m00Tcm4TlvDq8ikWAM'), // Default Rachel (placeholder)
  BUSINESS_NAME: z.string().default('Prattville Midwifery, LLC'),
  LLM_MODEL: z.string().default('gpt-3.5-turbo'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const config = parsedEnv.data;

export type BusinessHours = Record<string, [string, string][]>;

export const getBusinessHours = (): BusinessHours => {
  return config.MIDWIFERY_HOURS_JSON;
};

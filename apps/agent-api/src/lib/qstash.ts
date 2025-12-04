import { Client, Receiver } from '@upstash/qstash';
import logger from '../logger';
import env from '../env';

/**
 * Upstash QStash client for background job scheduling
 * Works in serverless environments - schedules HTTP callbacks
 */

let qstashClient: Client | null = null;
let qstashReceiver: Receiver | null = null;

/**
 * Check if QStash is configured
 */
export function isQStashConfigured(): boolean {
  return Boolean(env.QSTASH_TOKEN);
}

/**
 * Get or create the QStash client
 */
export function getQStashClient(): Client {
  if (!qstashClient) {
    if (!env.QSTASH_TOKEN) {
      throw new Error('QSTASH_TOKEN not configured');
    }

    qstashClient = new Client({
      token: env.QSTASH_TOKEN,
    });

    logger.info('QStash client initialized');
  }

  return qstashClient;
}

/**
 * Get or create the QStash receiver for verifying webhooks
 */
export function getQStashReceiver(): Receiver {
  if (!qstashReceiver) {
    if (!env.QSTASH_CURRENT_SIGNING_KEY || !env.QSTASH_NEXT_SIGNING_KEY) {
      throw new Error('QStash signing keys not configured');
    }

    qstashReceiver = new Receiver({
      currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
    });
  }

  return qstashReceiver;
}

/**
 * Publish a message to QStash for background processing
 */
export async function publishJob(
  url: string,
  body: Record<string, unknown>,
  options?: {
    delay?: number; // Delay in seconds
    retries?: number;
    deduplicationId?: string;
  },
) {
  const client = getQStashClient();

  const result = await client.publishJSON({
    url,
    body,
    delay: options?.delay,
    retries: options?.retries ?? 3,
    deduplicationId: options?.deduplicationId,
  });

  logger.debug({ messageId: result.messageId, url }, 'QStash job published');
  return result;
}

/**
 * Schedule a recurring job with QStash
 */
export async function scheduleJob(
  url: string,
  body: Record<string, unknown>,
  cron: string, // Cron expression
  options?: {
    scheduleId?: string;
  },
) {
  const client = getQStashClient();

  const result = await client.schedules.create({
    destination: url,
    body: JSON.stringify(body),
    cron,
    scheduleId: options?.scheduleId,
  });

  logger.info({ scheduleId: result.scheduleId, cron, url }, 'QStash schedule created');
  return result;
}

/**
 * Delete a scheduled job
 */
export async function deleteSchedule(scheduleId: string) {
  const client = getQStashClient();
  await client.schedules.delete(scheduleId);
  logger.info({ scheduleId }, 'QStash schedule deleted');
}

/**
 * List all scheduled jobs
 */
export async function listSchedules() {
  const client = getQStashClient();
  return client.schedules.list();
}

/**
 * Verify a QStash webhook signature
 */
export async function verifyQStashSignature(signature: string, body: string): Promise<boolean> {
  try {
    const receiver = getQStashReceiver();
    await receiver.verify({
      signature,
      body,
    });
    return true;
  } catch (err) {
    logger.warn({ err }, 'QStash signature verification failed');
    return false;
  }
}

/**
 * Express middleware to verify QStash webhooks
 */
export function qstashWebhookMiddleware() {
  return async (
    req: { headers: Record<string, string | string[] | undefined>; body: unknown },
    res: { status: (code: number) => { json: (data: unknown) => void } },
    next: () => void,
  ) => {
    const signature = req.headers['upstash-signature'] as string;
    if (!signature) {
      res.status(401).json({ error: 'Missing QStash signature' });
      return;
    }

    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const isValid = await verifyQStashSignature(signature, body);

    if (!isValid) {
      res.status(401).json({ error: 'Invalid QStash signature' });
      return;
    }

    next();
  };
}

export default {
  getQStashClient,
  getQStashReceiver,
  publishJob,
  scheduleJob,
  deleteSchedule,
  listSchedules,
  verifyQStashSignature,
  qstashWebhookMiddleware,
  isQStashConfigured,
};

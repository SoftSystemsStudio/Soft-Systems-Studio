import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import env from './env';

const connection = new IORedis(env.REDIS_URL);

export const ingestQueue = new Queue('ingest', { connection });

export default { ingestQueue, connection };

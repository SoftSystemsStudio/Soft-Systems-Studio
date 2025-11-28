import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import env from './env';
import { queueWaitingGauge, queueActiveGauge, queueFailedGauge } from './metrics';

const connection = new IORedis(env.REDIS_URL);

export const ingestQueue = new Queue('ingest', { connection });

// poll and update metrics periodically if prom-client is available
async function update() {
	try {
		const counts = await ingestQueue.getJobCounts();
		queueWaitingGauge.set(counts.waiting || 0);
		queueActiveGauge.set(counts.active || 0);
		queueFailedGauge.set(counts.failed || 0);
	} catch (e) {
		// ignore
	}
}

setInterval(update, 5000);

export default { ingestQueue, connection };

import 'dotenv/config';
import { Worker } from 'bullmq';
import env from '../env';
import { upsertDocuments } from '../services/qdrant';
import prisma from '../db';
import IORedis from 'ioredis';

const connection = new IORedis(env.REDIS_URL);

const worker = new Worker(
  'ingest',
  async (job) => {
    type IngestDoc = { text?: string; content?: string; title?: string };
    type IngestJob = { workspaceId: string; documents: IngestDoc[] };
    const { workspaceId, documents } = job.data as IngestJob;
    console.log('[worker] processing ingest for', workspaceId, 'docs:', documents.length);
    // verify workspace exists before doing work
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      const err = new Error(`[worker] workspace not found: ${workspaceId}`);
      console.error(err.message);
      throw err; // let job retry / DLQ handle it
    }

    // upsert into qdrant
    await upsertDocuments(
      documents.map((d, i: number) => ({
        id: `${workspaceId}-${Date.now()}-${i}`,
        text: d.text || d.content || '',
        metadata: { title: d.title || null },
      }))
    );

    // persist to Postgres KbDocument
    try {
      const rows = documents.map((d) => ({
        workspaceId,
        title: d.title || null,
        content: d.text || d.content || '',
      }));
      await prisma.kbDocument.createMany({ data: rows });
    } catch (e) {
      console.error('[worker] failed to persist kb documents', e);
      throw e;
    }

    return { ok: true };
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log('[worker] job completed', job.id);
});

worker.on('failed', (job, err) => {
  console.error('[worker] job failed', job?.id, err);
});

console.log('[worker] ingest worker started');

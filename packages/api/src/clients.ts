import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { buildClientConfigFromIntake } from '../../agency-core/src/mapping';
import type { ClientConfig } from '../../agency-core/src/configTypes';
import { generateSolutionBrief, generatePhaseProposal } from './llm';

const prisma = new PrismaClient();
const router = Router();

// POST /intake
router.post('/intake', async (req: Request, res: Response) => {
  try {
    const raw = req.body;

    // Persist raw intake JSON
    const intake = await prisma.intakeSubmission.create({ data: { raw } });

    // Build normalized ClientConfig from intake (stubbed mapping)
    const config = buildClientConfigFromIntake(raw as any);

    // Upsert client and client config. Keep minimal logic here.
    const client = await prisma.client.upsert({
      where: { id: config.clientId },
      update: {
        companyName: config.profile.companyName,
        website: config.profile.website,
        industry: config.profile.industry,
        size: config.profile.size,
        contactName: config.contact?.name ?? null,
        contactEmail: config.contact?.email ?? null,
        contactPhone: config.contact?.phone ?? null,
      },
      create: {
        id: config.clientId,
        companyName: config.profile.companyName,
        website: config.profile.website,
        industry: config.profile.industry,
        size: config.profile.size,
        contactName: config.contact?.name ?? null,
        contactEmail: config.contact?.email ?? null,
        contactPhone: config.contact?.phone ?? null,
      },
    });

    // Persist ClientConfig JSON
    const serialized = JSON.stringify(config);
    await prisma.clientConfig.upsert({
      where: { clientId: client.id },
      update: { config: JSON.parse(serialized) },
      create: { clientId: client.id, config: JSON.parse(serialized) },
    });

    return res.status(201).json({ intakeId: intake.id, clientId: client.id, config });
  } catch (err: unknown) {
    console.error('intake error', err);
    const message = (err as { message?: string })?.message ?? 'server_error';
    return res.status(500).json({ error: message });
  }
});

// GET /clients
router.get('/clients', async (_req: Request, res: Response) => {
  const clients = await prisma.client.findMany({
    select: { id: true, companyName: true, website: true, industry: true, createdAt: true },
  });
  res.json(clients);
});

// GET /clients/:id/config
router.get('/clients/:id/config', async (req: Request, res: Response) => {
  const { id } = req.params;
  const cfg = await prisma.clientConfig.findUnique({ where: { clientId: id } });
  if (!cfg) return res.status(404).json({ error: 'not_found' });
  return res.json({ config: cfg.config });
});

// POST /clients/:id/solution-brief
router.post('/clients/:id/solution-brief', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cfg = await prisma.clientConfig.findUnique({ where: { clientId: id } });
    if (!cfg) return res.status(404).json({ error: 'client_config_not_found' });

    const clientConfigJson = JSON.stringify(cfg.config);
    const draft = await generateSolutionBrief(clientConfigJson);

    // NOTE: stubbed response. Persist drafts or revisions as needed.
    return res.json({ draft });
  } catch (err: unknown) {
    console.error('solution-brief error', err);
    const message = (err as { message?: string })?.message ?? 'server_error';
    return res.status(500).json({ error: message });
  }
});

// POST /clients/:id/proposal
router.post('/clients/:id/proposal', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { phase = 1 } = req.body as { phase?: number };
    const cfg = await prisma.clientConfig.findUnique({ where: { clientId: id } });
    if (!cfg) return res.status(404).json({ error: 'client_config_not_found' });

    const clientConfigJson = JSON.stringify(cfg.config);
    const draft = await generatePhaseProposal(clientConfigJson, Number(phase));

    return res.json({ draft });
  } catch (err: unknown) {
    console.error('proposal error', err);
    const message = (err as { message?: string })?.message ?? 'server_error';
    return res.status(500).json({ error: message });
  }
});

export default router;

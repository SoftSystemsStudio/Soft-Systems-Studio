import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { buildClientConfigFromIntake } from '../../agency-core/src/mapping';
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
    const config = buildClientConfigFromIntake(raw);

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
    const { force } = req.body as { force?: boolean };

    const cfg = await prisma.clientConfig.findUnique({ where: { clientId: id } });
    if (!cfg) return res.status(404).json({ error: 'client_config_not_found' });

    // 1) If not forcing, return existing draft if present
    if (!force) {
      const existing = await prisma.proposalDraft.findUnique({
        where: {
          client_phase_kind_unique: {
            clientId: id,
            phase: 0, // convention: 0 = solution brief
            kind: 'solution_brief',
          },
        },
      });

      if (existing) {
        return res.json({
          draft: existing.content,
          saved: {
            id: existing.id,
            createdAt: existing.createdAt,
            updatedAt: existing.updatedAt,
            source: 'existing',
          },
        });
      }
    }

    // 2) No existing draft (or force=true): generate a new one
    const clientConfigJson = JSON.stringify(cfg.config);
    const generatedDraft = await generateSolutionBrief(clientConfigJson);
    const content = String(generatedDraft ?? '');

    // 3) Upsert into ProposalDraft
    const saved = await prisma.proposalDraft.upsert({
      where: {
        client_phase_kind_unique: {
          clientId: id,
          phase: 0,
          kind: 'solution_brief',
        },
      },
      update: { content },
      create: {
        clientId: id,
        phase: 0,
        kind: 'solution_brief',
        content,
      },
    });

    return res.json({
      draft: saved.content,
      saved: {
        id: saved.id,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
        source: 'generated',
      },
    });
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
    const { phase = 1, force } = req.body as { phase?: number; force?: boolean };
    const numericPhase = Number(phase) || 1;

    const cfg = await prisma.clientConfig.findUnique({ where: { clientId: id } });
    if (!cfg) return res.status(404).json({ error: 'client_config_not_found' });

    // 1) If not forcing, return existing draft if present
    if (!force) {
      const existing = await prisma.proposalDraft.findUnique({
        where: {
          client_phase_kind_unique: {
            clientId: id,
            phase: numericPhase,
            kind: 'phase_proposal',
          },
        },
      });

      if (existing) {
        return res.json({
          draft: existing.content,
          saved: {
            id: existing.id,
            createdAt: existing.createdAt,
            updatedAt: existing.updatedAt,
            source: 'existing',
          },
        });
      }
    }

    // 2) No existing draft (or force=true): generate a new one
    const clientConfigJson = JSON.stringify(cfg.config);
    const generatedDraft = await generatePhaseProposal(clientConfigJson, numericPhase);
    const content = String(generatedDraft ?? '');

    // 3) Upsert into ProposalDraft
    const saved = await prisma.proposalDraft.upsert({
      where: {
        client_phase_kind_unique: {
          clientId: id,
          phase: numericPhase,
          kind: 'phase_proposal',
        },
      },
      update: { content },
      create: {
        clientId: id,
        phase: numericPhase,
        kind: 'phase_proposal',
        content,
      },
    });

    return res.json({
      draft: saved.content,
      saved: {
        id: saved.id,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
        source: 'generated',
      },
    });
  } catch (err: unknown) {
    console.error('proposal error', err);
    const message = (err as { message?: string })?.message ?? 'server_error';
    return res.status(500).json({ error: message });
  }
});

export default router;

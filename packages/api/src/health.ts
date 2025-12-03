import { Router } from 'express';
import type { Router as RouterType } from 'express';
import logger from './logger';

const router: RouterType = Router();

router.get('/', async (req, res) => {
  // Basic health response. Expand to DB checks later.
  const uptime = process.uptime();
  logger.info({ uptime }, 'health_check');
  res.json({ status: 'ok', uptime });
});

export default router;

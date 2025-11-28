import express from 'express';
import { json } from 'body-parser';
import { logger } from './logger';
import healthRouter from './health';

const app = express();
app.use(json());

app.use('/health', healthRouter);

app.get('/', (req, res) => {
  logger.info({ path: req.path }, 'root hit');
  res.json({ status: 'ok', name: 'soft-systems-api' });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  logger.info({ port }, 'server_started');
});

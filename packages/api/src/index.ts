// packages/api/src/index.ts
import express from 'express';
import logger from './logger';
import clientsRouter from './clients'; // <- make sure this path matches your clients.ts

const app = express();
const PORT = process.env.PORT || 4000;

// Parse JSON request bodies
app.use(express.json());

// Mount API routes (intake, clients, etc.)
app.use(clientsRouter);

app.listen(PORT, () => {
  logger.info(`API server listening on port ${PORT}`);
});

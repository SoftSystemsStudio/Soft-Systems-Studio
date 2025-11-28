import express from 'express';
import bodyParser from 'body-parser';
import { handleChat } from '../../packages/agent-customer-service/src/handlers/chat';

const app = express();
app.use(bodyParser.json());

app.post('/api/agents/customer-service/chat', async (req, res) => {
  try {
    const result = await handleChat(req.body);
    if (result.status && result.body) return res.status(result.status).json(result.body);
    return res.status(500).json({ error: 'unknown' });
  } catch (err: any) {
    console.error('chat error', err);
    return res.status(500).json({ error: err?.message || 'server_error' });
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(port, () => console.log(`agent-api listening on ${port}`));

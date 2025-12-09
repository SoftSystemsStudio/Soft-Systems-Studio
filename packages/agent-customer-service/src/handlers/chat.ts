import { ChatRequest, ChatResponse } from '../schemas';
import { promises as fs } from 'fs';
import path from 'path';
import {
  ContextWindowManager,
  TokenCounter,
  CostAccountingService,
  ExecutionController,
} from '@softsystems/agent-orchestrator';

export async function handleChat(body: unknown) {
  const parse = ChatRequest.safeParse(body);
  if (!parse.success) {
    return { status: 400, body: { error: 'invalid_payload' } };
  }

  const { message, workspaceId, userId } = parse.data;

  // Load prompts
  const systemPath = path.join(__dirname, '../prompts/system.md');
  const userPath = path.join(__dirname, '../prompts/user.md');
  const systemPrompt = String(await fs.readFile(systemPath, 'utf-8'));
  const userHint = String(await fs.readFile(userPath, 'utf-8'));

  // Compose input for orchestrator
  const input = { workspaceId, userId, message };

  // instantiate minimal collaborators (these can be injected in a richer app)
  const ctxManager = new ContextWindowManager();
  const tokenCounter = new TokenCounter();
  const costService = new CostAccountingService();
  // initialize the shared orchestrator state manager
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const orchestrator = require('@softsystems/agent-orchestrator');
  if (typeof orchestrator.initState === 'function') {
    const requireRedis = process.env.NODE_ENV === 'production' && !!process.env.REDIS_URL;
    await orchestrator.initState({ requireRedis });
  }
  const stateManager = orchestrator.getStateManager();

  const controller = new ExecutionController(
    ctxManager as any,
    tokenCounter as any,
    costService as any,
    undefined,
    stateManager,
  );

  const result = await controller.runChat(
    input,
    systemPrompt + '\n\n' + userHint + `\n\nUser: ${message}`,
  );

  const needsHuman = /NEEDS_HUMAN/.test(result.reply);

  const response = ChatResponse.parse({ reply: result.reply, needsHuman });

  // TODO: persist to conversation store (Postgres) and log structured metadata
  console.log(
    '[handleChat] workspace',
    workspaceId,
    'user',
    userId,
    'replyLength',
    result.reply.length,
    'tokensIn',
    result.tokensIn,
  );

  return { status: 200, body: response };
}

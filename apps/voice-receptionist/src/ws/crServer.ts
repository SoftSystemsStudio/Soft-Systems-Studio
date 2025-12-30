import { FastifyInstance, FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';
import { validateTwilioSignature } from '../utils/twilioSignature';
import { generateResponse } from '../llm/client';
import { detectUrgency, isBusinessHours, UrgencyLevel } from '../logic/router';
import { buildPayload } from '../logic/payload';
import { config } from '../config';
// OpenAI types not required here

/**
 * Production notes (operational improvements baked in):
 * - Natural call flow: shorter greeting, delayed acknowledgements only when needed
 * - Anti-talkover: interrupt cancels in-flight turn via turnId + interrupted flag
 * - Escalation transparency: caller is told when escalation is triggered
 * - Language normalization: forces 'en-US'/'es-US'
 * - Safer webhook handling: non-blocking escalation send, guarded intake sends
 */

type Lang = 'en-US' | 'es-US';

interface SessionContext {
  scheduling_requested?: boolean;
  [k: string]: unknown;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: unknown;
}

type OAChatMsg = { role: string; content?: string; name?: string };

interface SessionState {
  callSid: string;
  streamSid: string;
  from: string;
  language: Lang;
  history: ChatMessage[];
  context: SessionContext;
  startTime: Date;
  urgency: UrgencyLevel;

  // Turn-control
  interrupted: boolean;
  turnId: number;
}

// -----------------------------
// Phrasebook (phone-native copy)
// -----------------------------
function pick(arr: string[], seed?: number) {
  return arr[(seed ?? Math.floor(Math.random() * arr.length)) % arr.length];
}

function normalizeLang(input: unknown): Lang {
  if (typeof input === 'string') {
    return input.toLowerCase().startsWith('es') ? 'es-US' : 'en-US';
  }
  return 'en-US';
}

function getDisplayName() {
  const rawName = config.BUSINESS_NAME || 'Our Office';
  return rawName.replace(/,?\s*LLC\.?$/i, '').trim();
}

function greeting(displayName: string, lang: Lang) {
  if (lang === 'es-US') {
    return `Hola, gracias por llamar a ${displayName}. ¿En qué puedo ayudarle hoy?`;
  }
  return `Hi, thanks for calling ${displayName}. How can I help today?`;
}

function ack(lang: Lang) {
  if (lang === 'es-US') {
    return pick(['Perfecto.', 'Entiendo.', 'De acuerdo.', 'Claro — un momento.']);
  }
  return pick(['Got it.', 'Okay.', 'Understood.', 'Sure — one moment.']);
}

function escalationNotice(lang: Lang) {
  if (lang === 'es-US') {
    return 'Gracias — esto parece urgente. Voy a avisar a alguien ahora. ¿Puede decirme brevemente qué pasó y cuál es el mejor número para devolverle la llamada?';
  }
  return 'Thanks — this sounds urgent. I’m alerting someone now. Can you briefly tell me what happened and the best callback number?';
}

function technicalFallback(lang: Lang) {
  if (lang === 'es-US') {
    return 'Lo siento — estoy teniendo un problema técnico. Si gusta, puedo tomar un mensaje y pedir que le devuelvan la llamada.';
  }
  return 'Sorry — I’m running into a technical issue. If you’d like, I can take a message and have someone call you back.';
}

function tightenForPhone(s: string) {
  return (s || '')
    .replace(/\s+/g, ' ')
    .replace(/^Sure[,—]\s*/i, '')
    .trim();
}


// -----------------------------
// Hardening Utilities
// -----------------------------

/**
 * Enhanced Logger that includes session context
 */
function log(level: 'info' | 'warn' | 'error' | 'debug', msg: string, state?: SessionState, data?: unknown) {
  const meta = {
    callSid: state?.callSid || 'unknown',
    streamSid: state?.streamSid || 'unknown',
    timestamp: new Date().toISOString(),
  };

  const payload = data ? { ...meta, data } : meta;

  // In a real logger (like Pino used in agent-api), we would pass the object directly.
  // For console, we format it slightly for readability.
  const prefix = `[${level.toUpperCase()}] [${meta.callSid}]`;

  if (level === 'error') console.error(prefix, msg, payload);
  else if (level === 'warn') console.warn(prefix, msg, payload);
  // else if (level === 'debug') console.debug(prefix, msg, payload); // Too verbose for prod
  else console.log(prefix, msg, payload);
}

/**
 * Retry utility for critical side-effects like webhooks
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, delayMs * Math.pow(2, i))); // Exponential backoff
      }
    }
  }
  throw lastError;
}

async function sendWebhook(url: string, payload: unknown, triggerText?: string, state?: SessionState) {
  if (!url) {
    log('warn', 'Webhook URL missing; skipping send.', state);
    return;
  }

  const body: unknown = triggerText
    ? isObject(payload)
      ? { ...payload, trigger_text: triggerText }
      : { payload, trigger_text: triggerText }
    : payload;

  try {
    await withRetry(async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    });
    log('info', `Webhook sent to ${url}`, state);
  } catch (err) {
    log('error', `Failed to send webhook to ${url} after retries`, state, err);
  }
}

// -------------------------------------
// Routes
// -------------------------------------
export default function crRoutes(fastify: FastifyInstance) {
  fastify.get('/ws', { websocket: true }, (connection, req: FastifyRequest) => {
    // Validate signature: best-effort using existing helper which expects (url, params, signature)
    const rawUrl =
      typeof (req as { url?: unknown }).url === 'string'
        ? String((req as { url: string }).url)
        : '';
    const headers = (req.headers as Record<string, string | string[] | undefined>) || {};
    const host = typeof headers.host === 'string' ? headers.host : '';
    const fullUrl = host ? `https://${host}${rawUrl}` : rawUrl;
    const signatureHeader =
      typeof headers['x-twilio-signature'] === 'string' ? headers['x-twilio-signature'] : '';
    const params: Record<string, unknown> =
      typeof req.query === 'object' && req.query !== null
        ? (req.query as Record<string, unknown>)
        : {};
    const sigOk = validateTwilioSignature(fullUrl, params, signatureHeader);

    // DEV BYPASS
    if (!sigOk && process.env.NODE_ENV !== 'development') {
      connection.socket.close();
      return;
    } else if (!sigOk) {
      log('warn', 'Twilio Signature validation failed but proceeding in DEV mode', undefined);
    }

    const state: SessionState = {
      callSid: '',
      streamSid: '',
      from: '',
      language: 'en-US',
      history: [],
      context: {},
      startTime: new Date(),
      urgency: 'normal',
      interrupted: false,
      turnId: 0,
    };

    // Heartbeat: Keep connection alive
    const pingInterval = setInterval(() => {
      if (connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.ping();
      }
    }, 30000);

    // non-async message handler to satisfy no-misused-promises; delegate to async worker
    connection.socket.on('message', (message: Buffer) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(message.toString());
      } catch {
        parsed = undefined;
      }

      void handleSocketMessage(parsed, state, connection.socket).catch((e) =>
        log('error', 'handleSocketMessage error', state, e)
      );
    });

    connection.socket.on('close', () => {
      clearInterval(pingInterval);
      void handleClose(state).catch((e) => log('error', 'handleClose error', state, e));
    });

    connection.socket.on('error', (err) => {
      log('error', 'Socket error', state, err);
      clearInterval(pingInterval);
    });
  });
}

// -----------------------------
// Twilio CR message types + guards
// -----------------------------
interface SetupMessage {
  type: 'setup';
  callSid?: string;
  streamSid?: string;
  from?: string;
  lang?: string;
  language?: string;
}

interface PromptMessage {
  type: 'prompt';
  voicePrompt?: string;
  input?: string;
  text?: string;
  lang?: string;
}

interface InterruptMessage {
  type: 'interrupt';
}

interface DTMFMessage {
  type: 'dtmf';
  digits?: string;
}

// TwilioCRMessage type not used elsewhere

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function isSetupMessage(m: unknown): m is SetupMessage {
  return isObject(m) && m.type === 'setup';
}

function isPromptMessage(m: unknown): m is PromptMessage {
  return isObject(m) && m.type === 'prompt';
}

function isInterruptMessage(m: unknown): m is InterruptMessage {
  return isObject(m) && m.type === 'interrupt';
}

function isDTMFMessage(m: unknown): m is DTMFMessage {
  return isObject(m) && m.type === 'dtmf';
}

async function handleSocketMessage(msg: unknown, state: SessionState, socket: WebSocket) {
  if (!msg) {
    log('warn', 'Received invalid JSON message', state);
    return;
  }

  if (isSetupMessage(msg)) {
    handleSetup(msg, state, socket);
    return;
  }

  if (isPromptMessage(msg)) {
    await handlePrompt(msg, state, socket);
    return;
  }

  if (isInterruptMessage(msg)) {
    handleInterrupt(msg, state);
    return;
  }

  if (isDTMFMessage(msg)) {
    log('info', `Received DTMF: ${msg.digits}`, state);
    return;
  }

  log('warn', `Unknown message type: ${(isObject(msg) && String(msg.type)) || typeof msg}`, state);
}

function handleSetup(msg: SetupMessage, state: SessionState, socket?: WebSocket) {
  log('info', 'Call Setup', state, msg);

  state.callSid = msg.callSid ?? '';
  state.streamSid = msg.streamSid ?? '';
  state.from = msg.from ?? '';

  // Determine language as early as possible
  state.language = normalizeLang(msg.lang ?? msg.language ?? state.language);

  // Send greeting as a complete turn (no filler)
  try {
    const displayName = getDisplayName();
    const text = greeting(displayName, state.language);
    socket?.send(JSON.stringify({ type: 'text', token: text, last: true, lang: state.language }));
  } catch (e) {
    log('error', 'Failed to send greeting', state, e);
  }
}

async function handlePrompt(msg: PromptMessage, state: SessionState, socket: WebSocket) {
  // Twilio CR docs: type: 'prompt', voicePrompt: 'text', lang: 'en-US'
  const userText = msg.voicePrompt ?? msg.input ?? msg.text;
  if (!userText) return;

  // Start a new "turn"
  state.turnId += 1;
  const myTurn = state.turnId;
  state.interrupted = false;

  // Language switch
  if (msg.lang) state.language = normalizeLang(msg.lang);

  log('info', `User Prompt: ${userText}`, state);

  // Urgency detection + escalation (transparent to caller)
  const urgency = detectUrgency(userText);
  if (urgency !== 'normal') {
    state.urgency = urgency;
    log('info', `Urgency Detected: ${urgency}`, state);

    // Tell caller immediately
    try {
      socket.send(
        JSON.stringify({
          type: 'text',
          token: escalationNotice(state.language),
          last: true,
          lang: state.language,
        }),
      );
    } catch (e) {
      log('warn', 'Failed to send escalation notice', state, e);
    }

    // Fire escalation webhook in background (do not block the call)
    // Pass state to use new retry logic
    sendWebhook(config.N8N_ESCALATION_WEBHOOK_URL, state, userText, state).catch((e) =>
      log('error', 'Escalation webhook failed', state, e)
    );
  }

  // Add to conversation history
  state.history.push({ role: 'user', content: userText });

  // Delayed acknowledgement: only send if the model takes noticeable time
  let ackSent = false;
  const ackTimer = setTimeout(() => {
    // If we’re still on the same turn and not interrupted, send a short ack
    if (state.turnId !== myTurn || state.interrupted) return;
    try {
      socket.send(
        JSON.stringify({
          type: 'text',
          token: ack(state.language),
          last: true,
          lang: state.language,
        }),
      );
      ackSent = true;
    } catch (e) {
      log('warn', 'Failed to send ack', state, e);
    }
  }, 550);

  // LLM generation
  let text: string | undefined;
  let functionCall: unknown;

  try {
    const openaiHistory: OAChatMsg[] = state.history.map((m) => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : contentToString(m.content),
    }));

    const res = await generateResponse(
      openaiHistory as unknown as Parameters<typeof generateResponse>[0],
      state.language,
    );
    text = res?.text;
    functionCall = res?.functionCall;
  } catch (err) {
    log('error', 'Error generating LLM response', state, err);
    text = technicalFallback(state.language);
  } finally {
    clearTimeout(ackTimer);
  }

  // If caller interrupted (or a new prompt came in), drop this response
  if (state.turnId !== myTurn || state.interrupted) return;

  // Context updates via tool call
  if (isObject(functionCall)) {
    const fc = functionCall as { name?: unknown; arguments?: unknown };
    if (typeof fc.name === 'string' && fc.name === 'update_context') {
      try {
        const rawArgs =
          typeof fc.arguments === 'string' ? fc.arguments : JSON.stringify(fc.arguments ?? {});
        const parsedArgs: unknown = JSON.parse(rawArgs);
        if (isObject(parsedArgs)) {
          state.context = { ...state.context, ...parsedArgs };
          log('info', 'Context Updated', state, parsedArgs);
        } else {
          log('warn', 'update_context args not an object', state, parsedArgs);
        }
      } catch (e) {
        log('warn', 'Failed to parse update_context args', state, e);
      }
    }
  }

  // Send response
  if (text) {
    const finalText = ackSent ? tightenForPhone(text) : (text || '').trim();

    state.history.push({ role: 'assistant', content: finalText });

    const responseMsg = { type: 'text', token: finalText, last: true, lang: state.language };
    log('info', 'Sending Output', state, { token: finalText });

    try {
      socket.send(JSON.stringify(responseMsg));
    } catch (sendErr) {
      log('error', 'Failed to send response over websocket', state, sendErr);
    }
  }
}

function handleInterrupt(msg: InterruptMessage, state: SessionState) {
  log('info', 'Interrupted', state);

  // Mark interrupted and invalidate any in-flight generation for the current turn
  state.interrupted = true;
  state.turnId += 1;
}

async function handleClose(state: SessionState) {
  log('info', 'Call Ended', state);

  const endTime = new Date();
  const businessHours = isBusinessHours(state.startTime);

  // Build payload
  const payload = buildPayload(
    state.callSid,
    state.from,
    state.startTime,
    endTime,
    state.language,
    state.context,
    state.urgency,
    businessHours,
    state.history.map((m) => `${m.role}: ${contentToString(m.content)}`).join('\n'),
  );

  // Send intake webhook
  await sendWebhook(config.N8N_INTAKE_WEBHOOK_URL, payload, undefined, state);

  // Send scheduling webhook if requested
  if (state.context?.scheduling_requested) {
    await sendWebhook(config.N8N_SCHEDULING_WEBHOOK_URL, payload, undefined, state);
  }
}

function contentToString(content: unknown): string {
  if (typeof content === 'string') return content;
  if (typeof content === 'number' || typeof content === 'boolean') return String(content);
  if (Array.isArray(content)) return content.map((c) => contentToString(c)).join(' ');
  if (isObject(content)) {
    try {
      return JSON.stringify(content);
    } catch {
      return String(content);
    }
  }
  return String(content ?? '');
}

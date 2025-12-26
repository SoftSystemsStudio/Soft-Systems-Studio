import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';
import { validateTwilioSignature } from '../utils/twilioSignature';
import { generateResponse } from '../llm/client';
import { detectUrgency, isBusinessHours, UrgencyLevel } from '../logic/router';
import { buildPayload } from '../logic/payload';
import { config } from '../config';
import OpenAI from 'openai';

/**
 * Production notes (operational improvements baked in):
 * - Natural call flow: shorter greeting, delayed acknowledgements only when needed
 * - Anti-talkover: interrupt cancels in-flight turn via turnId + interrupted flag
 * - Escalation transparency: caller is told when escalation is triggered
 * - Language normalization: forces 'en-US'/'es-US'
 * - Safer webhook handling: non-blocking escalation send, guarded intake sends
 */

type Lang = 'en-US' | 'es-US';

interface SessionState {
  callSid: string;
  streamSid: string;
  from: string;
  language: Lang;
  history: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  context: any;
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

function normalizeLang(input: any): Lang {
  const v = (input || '').toString().toLowerCase();
  return v.startsWith('es') ? 'es-US' : 'en-US';
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

// -------------------------------------
// Routes
// -------------------------------------
export default async function crRoutes(fastify: FastifyInstance) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    // Signature validation: keep your existing logic; placeholder here.
    // Example:
    // const isValid = validateTwilioSignature(req, config.TWILIO_AUTH_TOKEN);
    // if (!isValid) { connection.socket.close(); return; }

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

    connection.socket.on('message', async (message: Buffer) => {
      try {
        const msg = JSON.parse(message.toString());

        switch (msg.type) {
          case 'setup':
            handleSetup(msg, state, connection.socket);
            break;
          case 'prompt':
            await handlePrompt(msg, state, connection.socket);
            break;
          case 'interrupt':
            handleInterrupt(msg, state);
            break;
          case 'dtmf':
            // Optional: implement DTMF-based routing if you need it.
            break;
          default:
            console.log('Unknown message type:', msg.type);
        }
      } catch (err) {
        console.error('Error processing message:', err);
      }
    });

    connection.socket.on('close', () => {
      handleClose(state).catch((e) => console.error('handleClose error:', e));
    });
  });
}

function handleSetup(msg: any, state: SessionState, socket?: WebSocket) {
  console.log('Setup:', msg);

  state.callSid = msg.callSid || '';
  state.streamSid = msg.streamSid || '';
  state.from = msg.from || '';

  // Determine language as early as possible
  state.language = normalizeLang(msg.lang || msg.language || state.language);

  // Send greeting as a complete turn (no filler)
  try {
    const displayName = getDisplayName();
    const text = greeting(displayName, state.language);
    socket?.send(JSON.stringify({ type: 'text', token: text, last: true, lang: state.language }));
  } catch (e) {
    console.error('Failed to send greeting:', e);
  }
}

async function handlePrompt(msg: any, state: SessionState, socket: WebSocket) {
  // Twilio CR docs: type: 'prompt', voicePrompt: 'text', lang: 'en-US'
  const userText = msg.voicePrompt || msg.input || msg.text;
  if (!userText) return;

  // Start a new "turn"
  state.turnId += 1;
  const myTurn = state.turnId;
  state.interrupted = false;

  // Language switch
  if (msg.lang) state.language = normalizeLang(msg.lang);

  console.log(`User (${state.language}): ${userText}`);

  // Urgency detection + escalation (transparent to caller)
  const urgency = detectUrgency(userText);
  if (urgency !== 'normal') {
    state.urgency = urgency;

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
      console.warn('Failed to send escalation notice:', e);
    }

    // Fire escalation webhook in background (do not block the call)
    sendWebhook(config.N8N_ESCALATION_WEBHOOK_URL, state, userText).catch((e) =>
      console.error('Escalation webhook failed:', e),
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
      console.warn('Failed to send ack:', e);
    }
  }, 550);

  // LLM generation
  let text: string | undefined;
  let functionCall: any | undefined;

  try {
    const res = await generateResponse(state.history, state.language);
    text = res?.text;
    functionCall = res?.functionCall;
  } catch (err) {
    console.error('Error generating LLM response:', err);
    text = technicalFallback(state.language);
  } finally {
    clearTimeout(ackTimer);
  }

  // If caller interrupted (or a new prompt came in), drop this response
  if (state.turnId !== myTurn || state.interrupted) return;

  // Context updates via tool call
  if (functionCall?.name === 'update_context') {
    try {
      const args = JSON.parse(functionCall.arguments || '{}');
      state.context = { ...state.context, ...args };
    } catch (e) {
      console.warn('Failed to parse update_context args:', e);
    }
  }

  // Send response
  if (text) {
    const finalText = ackSent ? tightenForPhone(text) : (text || '').trim();

    state.history.push({ role: 'assistant', content: finalText });

    const responseMsg = { type: 'text', token: finalText, last: true, lang: state.language };
    console.log('Sending response to Twilio CR websocket:', responseMsg);

    try {
      socket.send(JSON.stringify(responseMsg));
    } catch (sendErr) {
      console.error('Failed to send response over websocket:', sendErr);
    }
  }
}

function handleInterrupt(msg: any, state: SessionState) {
  console.log('Interrupted');

  // Mark interrupted and invalidate any in-flight generation for the current turn
  state.interrupted = true;
  state.turnId += 1;
}

async function handleClose(state: SessionState) {
  console.log('Call ended');

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
    state.history.map((m) => `${m.role}: ${m.content}`).join('\n'),
  );

  // Send intake webhook
  await sendWebhook(config.N8N_INTAKE_WEBHOOK_URL, payload);

  // Send scheduling webhook if requested
  if (state.context?.scheduling_requested) {
    await sendWebhook(config.N8N_SCHEDULING_WEBHOOK_URL, payload);
  }
}

async function sendWebhook(url: string, payload: any, triggerText?: string) {
  if (!url) {
    console.warn('Webhook URL missing; skipping send.');
    return;
  }

  try {
    const body = triggerText ? { ...payload, trigger_text: triggerText } : payload;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    console.log(`Webhook sent to ${url}`);
  } catch (err) {
    console.error(`Failed to send webhook to ${url}`, err);
  }
}

import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';
import { validateTwilioSignature } from '../utils/twilioSignature';
import { generateResponse } from '../llm/client';
import { detectUrgency, isBusinessHours, UrgencyLevel } from '../logic/router';
import { buildPayload } from '../logic/payload';
import { config } from '../config';
import OpenAI from 'openai';

interface SessionState {
  callSid: string;
  streamSid: string;
  from: string;
  language: 'en-US' | 'es-US';
  history: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  context: any;
  startTime: Date;
  urgency: UrgencyLevel;
}

export default async function crRoutes(fastify: FastifyInstance) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    // ... (signature validation)

    const state: SessionState = {
      callSid: '',
      streamSid: '',
      from: '',
      language: 'en-US', // Default
      history: [],
      context: {},
      startTime: new Date(),
      urgency: 'normal',
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
            // Handle DTMF if needed
            break;
          default:
            console.log('Unknown message type:', msg.type);
        }
      } catch (err) {
        console.error('Error processing message:', err);
      }
    });

    connection.socket.on('close', () => {
      handleClose(state);
    });
  });
}

function handleSetup(msg: any, state: SessionState, socket?: WebSocket) {
  console.log('Setup:', msg);
  state.callSid = msg.callSid;
  state.from = msg.from || '';
  // Send a friendly greeting immediately when the call is set up.
  try {
    const rawName = config.BUSINESS_NAME || 'Our Office';
    const displayName = rawName.replace(/,?\s*LLC\.?$/i, '').trim();
    // Determine language preference from the setup message or session state
    const preferredLang = (msg.lang || msg.language || state.language || 'en-US').toString();
    let greeting: string;
    if (preferredLang.toLowerCase().startsWith('es')) {
      greeting = `Hola, gracias por llamar a ${displayName}. Soy la recepcionista virtual — ¿en qué puedo ayudarle hoy?`;
    } else {
      greeting = `Hi — thanks for calling ${displayName}. I'm the virtual receptionist. How can I help you today?`;
    }
    if (socket && typeof socket.send === 'function') {
      socket.send(
        JSON.stringify({ type: 'text', token: greeting, last: false, lang: preferredLang }),
      );
    }
  } catch (e) {
    console.error('Failed to send greeting:', e);
  }
}

async function handlePrompt(msg: any, state: SessionState, socket: WebSocket) {
  const userText = msg.voicePrompt; // Check CR docs for exact field. Usually 'voicePrompt' or 'input'
  // CR docs: type: 'prompt', voicePrompt: 'text', lang: 'en-US'

  if (!userText) return;

  console.log(`User (${state.language}): ${userText}`);

  // 1. Detect Language Switch (Basic heuristic or rely on CR lang detection if enabled)
  if (msg.lang && msg.lang !== state.language) {
    state.language = msg.lang;
  }

  // 2. Urgency Detection
  const urgency = detectUrgency(userText);
  if (urgency !== 'normal') {
    state.urgency = urgency;
    // Trigger Escalation Webhook immediately
    await sendWebhook(config.N8N_ESCALATION_WEBHOOK_URL, state, userText);
  }

  // 3. Add to history
  state.history.push({ role: 'user', content: userText });

  // Send a quick acknowledgement immediately to reduce perceived latency
  try {
    const ack = state.language.startsWith('es')
      ? 'Un momento por favor, estoy verificando.'
      : 'One moment please, I am checking that for you.';
    const ackMsg = { type: 'text', token: ack, last: false, lang: state.language };
    socket.send(JSON.stringify(ackMsg));
  } catch (e) {
    console.warn('Failed to send ack message:', e);
  }

  // 4. LLM Generation (with fallback on error)
  let text: string | undefined;
  let functionCall: any | undefined;
  try {
    const res = await generateResponse(state.history, state.language);
    text = res.text;
    functionCall = res.functionCall;
  } catch (err) {
    console.error('Error generating LLM response, sending fallback:', err);
    text = state.language.startsWith('es')
      ? 'Lo siento, tengo problemas técnicos en este momento. Por favor, manténgase en la línea.'
      : "I'm sorry, I'm having technical difficulties right now. Please hold on the line.";
  }

  // 5. Update Context if function called
  if (functionCall && functionCall.name === 'update_context') {
    const args = JSON.parse(functionCall.arguments);
    state.context = { ...state.context, ...args };
    // Optionally send a silent confirmation or continue
  }

  // 6. Send Response
  if (text) {
    state.history.push({ role: 'assistant', content: text });

    // Send text token
    const responseMsg = {
      type: 'text',
      token: text,
      last: true,
      lang: state.language,
    };
    // Log outgoing messages for troubleshooting
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
  // Clear any pending generation or queue if we were streaming
}

async function handleClose(state: SessionState) {
  console.log('Call ended');
  const endTime = new Date();
  const businessHours = isBusinessHours(state.startTime);

  // Build Payload
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

  // Send Intake Webhook
  await sendWebhook(config.N8N_INTAKE_WEBHOOK_URL, payload);

  // Send Scheduling Webhook if requested
  if (state.context.scheduling_requested) {
    await sendWebhook(config.N8N_SCHEDULING_WEBHOOK_URL, payload);
  }
}

async function sendWebhook(url: string, payload: any, triggerText?: string) {
  try {
    // If it's an escalation, we might want to wrap the payload or send specific data
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

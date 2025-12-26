import { FastifyInstance } from 'fastify';
import { config } from '../config';

export default async function voiceRoutes(fastify: FastifyInstance) {
  fastify.post('/voice', async (request, reply) => {
    reply.type('text/xml');
    // Prefer explicit process.env override (useful when restarting in Codespaces)
    // Otherwise derive websocket URL from PUBLIC_BASE_URL so TwiML always returns
    // a wss:// URL that matches the public host.
    const publicBase = (process.env.PUBLIC_BASE_URL || config.PUBLIC_BASE_URL || '').replace(
      /\/$/,
      '',
    );
    const derivedFromPublic = publicBase
      ? publicBase.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:') + '/ws'
      : undefined;
    const wsUrl = process.env.WS_URL || derivedFromPublic || config.WS_URL;
    const enVoice = config.ELEVENLABS_VOICE_ID_EN;
    const esVoice = config.ELEVENLABS_VOICE_ID_ES;

    // Debug log to help Twilio troubleshooting (will appear in server logs)
    request.log.info(
      {
        wsUrl,
        publicBase: process.env.PUBLIC_BASE_URL || config.PUBLIC_BASE_URL,
        enVoice,
        esVoice,
      },
      'Serving /voice with WS URL and ElevenLabs voices',
    );

    // TwiML for ConversationRelay
    const twiml = `
<Response>
  <Connect>
    <ConversationRelay url="${wsUrl}">
    <Language code="en-US" ttsProvider="elevenlabs" voice="${enVoice}" />
    <Language code="es-US" ttsProvider="elevenlabs" voice="${esVoice}" />
      <Parameter name="clientId" value="midwifery_prattville" />
      <Parameter name="elevenlabsTextNormalization" value="on" />
    </ConversationRelay>
  </Connect>
</Response>
    `.trim();

    return twiml;
  });

  fastify.get('/health', async () => {
    return { status: 'ok' };
  });
}

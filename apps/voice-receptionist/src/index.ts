import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import formbody from '@fastify/formbody';
import { config } from './config';
import voiceRoutes from './routes/voice';
import crRoutes from './ws/crServer';

const fastify = Fastify({ logger: true });

const start = async () => {
  try {
    // Register plugins and routes sequentially so errors surface before listen
    (await fastify.register(formbody)) as unknown;
    // Temporarily skip websocket plugin to isolate startup timeout
    // (await fastify.register(websocket)) as unknown;
    console.log('attaching voiceRoutes directly');
    // Call route setup functions directly to avoid avvio plugin timeouts in this environment
    // (they are plain functions that accept the fastify instance).
    voiceRoutes(fastify as any);
    console.log('attached voiceRoutes');
    crRoutes(fastify as any);

    await fastify.listen({ port: config.PORT, host: '0.0.0.0' });
    console.log(`Server listening on ${config.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

void start();

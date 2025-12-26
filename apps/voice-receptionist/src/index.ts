import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import formbody from '@fastify/formbody';
import { config } from './config';
import voiceRoutes from './routes/voice';
import crRoutes from './ws/crServer';

const fastify = Fastify({
  logger: true,
});

fastify.register(formbody);
fastify.register(websocket);

fastify.register(voiceRoutes);
fastify.register(crRoutes);

const start = async () => {
  try {
    await fastify.listen({ port: config.PORT, host: '0.0.0.0' });
    console.log(`Server listening on ${config.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

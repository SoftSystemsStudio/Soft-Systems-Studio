import { FastifyInstance } from 'fastify';
import { config } from '../config';

console.log('voiceRoutes module loaded');

export default function voiceRoutes(fastify: FastifyInstance) {
  console.log('voiceRoutes plugin invoked (minimal)');
  fastify.get('/health', () => {
    return { status: 'ok' };
  });
  console.log('voiceRoutes: plugin setup complete (minimal)');
}

import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),

  migrate: {
    async adapter() {
      const connectionString = process.env.POSTGRES_URL;

      if (!connectionString) {
        throw new Error('POSTGRES_URL environment variable is required');
      }

      // Use the pg adapter for migrations
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const { Pool } = await import('pg');

      const pool = new Pool({ connectionString });
      return new PrismaPg(pool);
    },
  },
});

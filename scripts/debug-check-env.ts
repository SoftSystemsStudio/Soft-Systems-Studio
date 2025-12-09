// Quick helper to load the app env and print validation errors for debugging.
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.POSTGRES_URL = process.env.POSTGRES_URL ?? 'postgresql://postgres:postgres@localhost:5432/agent_api_test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-that-is-long-enough-123456';

(async () => {
  try {
    // Import the compiled TypeScript module via ts-node when available
    // This file is executed via the package `ts-node` binary so we can import TS modules.
    const env = await import('../apps/agent-api/src/env');
    console.log('Env parsed successfully:', Object.keys(env));
  } catch (err: any) {
    console.error('Env import failed:');
    if (err && err.errors) {
      console.error(JSON.stringify(err.errors, null, 2));
    } else {
      console.error(err && err.message ? err.message : err);
    }
    process.exit(1);
  }
})();

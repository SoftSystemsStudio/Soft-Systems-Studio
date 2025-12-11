// Load .env file before everything else
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

// Bootstrap runtime secrets (Vault) before importing the rest of the app.
(async () => {
  try {
    // TODO: Re-enable Vault after building bootstrap/vault module
    // try {
    //   const mod = await import('./bootstrap/vault');
    //   if (mod && typeof mod.bootstrapVault === 'function') {
    //     await mod.bootstrapVault();
    //   }
    // } catch (err) {
    //   const nodeEnv = process.env.NODE_ENV;
    //   const vaultFatal = process.env.VAULT_FATAL;
    //   const fatal =
    //     nodeEnv === 'production' && (vaultFatal === undefined || vaultFatal.toLowerCase() === 'true');
    //   if (fatal) {
    //     console.error('Vault bootstrap failed (fatal):', err);
    //     process.exit(1);
    //   }
    //   console.warn('Vault bootstrap error (continuing startup):', err);
    // }

    // Now require the app entry which imports `env` synchronously.
    // TODO: Re-enable after building @softsystems/agent-orchestrator package
    // try {
    //   const init = require('./lib/initState');
    //   if (init && typeof init.initState === 'function') {
    //     const requireRedis = process.env.NODE_ENV === 'production' && !!process.env.REDIS_URL;
    //     await init.initState({ requireRedis });
    //   }
    // } catch (e) {
    //   console.warn('initState failed (continuing):', e?.message || e);
    // }

    console.log('[start.ts] Loading index.ts...');
    require('./index');
    console.log('[start.ts] index.ts loaded successfully');
  } catch (err) {
    console.error('Fatal error during startup:', err);
    console.error('Stack:', err instanceof Error ? err.stack : 'No stack trace');
    process.exit(1);
  }
})().catch((err) => {
  console.error('Unhandled promise rejection in startup:', err);
  process.exit(1);
});

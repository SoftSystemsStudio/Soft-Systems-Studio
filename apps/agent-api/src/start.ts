// Bootstrap runtime secrets (Vault) before importing the rest of the app.
(async () => {
  try {
    // Dynamic import so this file can be required by ts-node-dev easily.
    const mod = await import('./bootstrap/vault.js');
    if (mod && typeof mod.bootstrapVault === 'function') {
      // attempt to bootstrap Vault (no-op if VAULT_ADDR not set)
      await mod.bootstrapVault();
    }
  } catch (err) {
    const nodeEnv = process.env.NODE_ENV;
    const vaultFatal = process.env.VAULT_FATAL;
    const fatal =
      nodeEnv === 'production' && (vaultFatal === undefined || vaultFatal.toLowerCase() === 'true');
    if (fatal) {
      // eslint-disable-next-line no-console
      console.error(
        'Vault bootstrap failed (fatal) — exiting to avoid running without required secrets:',
        err,
      );
      // Ensure a non-zero exit so orchestrators notice the failure
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }
    // Warn but continue startup to avoid blocking local dev when Vault isn't available.
    // eslint-disable-next-line no-console
    console.warn('Vault bootstrap error (continuing startup):', err);
  }

  // Now require the app entry which imports `env` synchronously.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // initialize shared state manager before loading the app
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const init = require('./lib/initState');
    if (init && typeof init.initState === 'function') {
      const requireRedis = process.env.NODE_ENV === 'production' && !!process.env.REDIS_URL;
      await init.initState({ requireRedis });
    }
  } catch (e) {
    // ignore init errors and continue; handlers will fallback to in-memory when needed
    // eslint-disable-next-line no-console
    console.warn('initState failed (continuing):', e?.message || e);
  }

  require('./index');
})();

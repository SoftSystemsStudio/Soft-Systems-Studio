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
    // Warn but continue startup to avoid blocking local dev when Vault isn't available.
    // eslint-disable-next-line no-console
    console.warn('Vault bootstrap error (continuing startup):', err);
  }

  // Now require the app entry which imports `env` synchronously.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('./index');
})();

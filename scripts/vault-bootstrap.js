#!/usr/bin/env node
// Bootstraps a local Vault dev server for this repo.
// Usage: VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=root node scripts/vault-bootstrap.js

const { execSync } = require('child_process');

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] });
}

function curlJson(method, path, body) {
  const addr = process.env.VAULT_ADDR || 'http://127.0.0.1:8200';
  const token = process.env.VAULT_TOKEN || 'root';
  const bodyArg = body ? `-d '${JSON.stringify(body)}'` : '';
  const cmd = `curl -sS -X ${method} -H "X-Vault-Token: ${token}" -H 'Content-Type: application/json' ${bodyArg} ${addr}${path}`;
  const out = execSync(cmd, { encoding: 'utf8' });
  try {
    return JSON.parse(out || '{}');
  } catch (err) {
    return out;
  }
}

(async function main() {
  try {
    console.log('Ensuring KV v2 is enabled at mount: /secret (v2)');
    // Enable KV v2 at secret (idempotent)
    try {
      curlJson('PUT', '/v1/sys/mounts/secret', { type: 'kv', options: { version: '2' } });
    } catch (e) {
      console.warn('Warning enabling mount (may already exist):', e && e.message ? e.message : e);
    }

    const policyName = 'softsystems-app-read';
    const policy = `path \"secret/data/*\" {\n  capabilities = [\"read\"]\n}\n`;
    console.log('Writing policy', policyName);
    curlJson('PUT', `/v1/sys/policies/acl/${policyName}`, { policy });

    const role = 'softsystems-app';
    console.log('Creating AppRole', role);
    curlJson('POST', `/v1/auth/approle/role/${role}`, {
      token_ttl: '1h',
      token_max_ttl: '4h',
      policies: [policyName],
    });

    console.log('Fetching role_id');
    const roleIdRes = curlJson('GET', `/v1/auth/approle/role/${role}/role-id`);
    console.log(
      'role_id:',
      roleIdRes.data && roleIdRes.data.role_id ? roleIdRes.data.role_id : JSON.stringify(roleIdRes),
    );

    console.log('Creating secret_id');
    const secretIdRes = curlJson('POST', `/v1/auth/approle/role/${role}/secret-id`);
    console.log(
      'secret_id:',
      secretIdRes.data && secretIdRes.data.secret_id
        ? secretIdRes.data.secret_id
        : JSON.stringify(secretIdRes),
    );

    console.log(
      '\nBootstrap complete. Use the printed role_id and secret_id (or set VAULT_TOKEN for admin operations).',
    );
  } catch (err) {
    console.error('Vault bootstrap failed:', err);
    process.exit(2);
  }
})();

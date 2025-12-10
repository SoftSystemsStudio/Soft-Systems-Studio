# HashiCorp Vault (overview and local dev)

This project sources runtime secrets from HashiCorp Vault via `bootstrapVault` in `apps/agent-api`.

## Local development (quick start)

- Start a local Vault dev server (for developer use only):

```bash
docker compose -f docker-compose.vault.yml up -d
```

- Bootstrap the vault (creates KV v2 mount, policy, and an AppRole):

```bash
VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=root node scripts/vault-bootstrap.js
```

- The script prints `role_id` and `secret_id`. Set these in your environment for local testing:

```bash
export VAULT_ROLE_ID=<role_id>
export VAULT_SECRET_ID=<secret_id>
export VAULT_ADDR=http://127.0.0.1:8200
```

Usage notes

- `VAULT_MAPPING` (optional): JSON mapping of env var names to Vault paths and keys. Example:

```json
{
  "DATABASE_URL": "app/prod/database#DATABASE_URL",
  "JWT_SECRET": "app/prod/jwt#JWT_SECRET"
}
```

The bootstrapper will combine `VAULT_MOUNT` (default `secret`) and `VAULT_PREFIX` (optional) to build full KV v2 paths, for example: `secret/myteam/app/prod/database`.

- `REQUIRED_ENV_VARS`: comma-separated env var names that must exist after Vault hydration. If `NODE_ENV=production` and `VAULT_FATAL` is not set to `false`, startup will exit with code 1 when missing required vars.

CI / Production

- Prefer short-lived authentication (GitHub OIDC) or an AppRole with tightly scoped policies.
- Do NOT store root tokens in CI. Use Vault's recommended auth methods and rotate credentials frequently.

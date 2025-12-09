import fetch from 'node-fetch';
import type { VaultKVv2Secret } from './vault.types';

export type VaultClient = {
  read(path: string): Promise<VaultKVv2Secret<Record<string, unknown>>>;
};

export type MappingEntry = {
  envName: string;
  path: string; // full KV path, e.g. 'secret/app/prod/db'
  key: string; // key inside data, e.g. 'DATABASE_URL'
};

const VAULT_ADDR = process.env.VAULT_ADDR;
const VAULT_ROLE_ID = process.env.VAULT_ROLE_ID;
const VAULT_SECRET_ID = process.env.VAULT_SECRET_ID;
const VAULT_TOKEN_ENV = process.env.VAULT_TOKEN;
const DEFAULT_MOUNT = 'secret';
const CACHE_TTL_DEFAULT = 300_000;

let runtimeToken: string | undefined = VAULT_TOKEN_ENV;

function prefixTrim(s: string | undefined) {
  return (s || '').replace(/^\/+|\/+$/g, '');
}

export function parseVaultMapping(
  raw: string | undefined,
  opts: { mount: string; prefix?: string },
): MappingEntry[] {
  if (!raw) return [];
  let parsed: Record<string, string> | null = null;
  try {
    parsed = JSON.parse(raw) as Record<string, string>;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Warning: VAULT_MAPPING JSON parse failed (skipping mapping).');
    return [];
  }

  const mount = opts.mount || DEFAULT_MOUNT;
  const prefix = prefixTrim(opts.prefix);

  const entries: MappingEntry[] = [];
  for (const [envName, mapping] of Object.entries(parsed)) {
    if (typeof mapping !== 'string' || !mapping.includes('#')) {
      // eslint-disable-next-line no-console
      console.warn(`Warning: VAULT_MAPPING entry for ${envName} is invalid and will be skipped.`);
      continue;
    }
    const [relativePath = '', key = ''] = mapping.split('#');
    const rel = relativePath.replace(/^\/+|\/+$/g, '');
    const parts = [mount];
    if (prefix) parts.push(prefix);
    if (rel) parts.push(rel);
    const fullPath = parts.join('/');
    entries.push({ envName, path: fullPath, key });
  }
  return entries;
}

async function approleLogin(roleId: string, secretId: string): Promise<string | undefined> {
  const url = `${VAULT_ADDR}/v1/auth/approle/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role_id: roleId, secret_id: secretId }),
  });
  if (!res.ok) {
    throw new Error(`Vault AppRole login failed: ${res.status} ${await res.text()}`);
  }
  const raw: unknown = await res.json();
  if (!raw || typeof raw !== 'object') return undefined;
  const asObj = raw as Record<string, unknown>;
  const auth = asObj['auth'];
  if (!auth || typeof auth !== 'object') return undefined;
  const clientToken = (auth as Record<string, unknown>)['client_token'];
  return typeof clientToken === 'string' ? clientToken : undefined;
}

async function getToken(): Promise<string | undefined> {
  if (runtimeToken) return runtimeToken;
  if (!VAULT_ADDR) return undefined;
  if (VAULT_ROLE_ID && VAULT_SECRET_ID) {
    runtimeToken = await approleLogin(VAULT_ROLE_ID, VAULT_SECRET_ID);
    return runtimeToken;
  }
  return undefined;
}

class HttpVaultClient implements VaultClient {
  constructor() {}

  async read(path: string): Promise<VaultKVv2Secret<Record<string, unknown>>> {
    if (!VAULT_ADDR) throw new Error('Vault address is not configured');
    const t = await getToken();
    if (!t) throw new Error('No Vault token available for reading secrets');
    // KV v2 read under mount/data/<path>
    const url = `${VAULT_ADDR}/v1/${path}`;
    const res = await fetch(url, { headers: { 'X-Vault-Token': t } });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Vault read failed ${res.status} ${body}`);
    }
    const raw: unknown = await res.json();
    if (!raw || typeof raw !== 'object') return {} as VaultKVv2Secret<Record<string, unknown>>;
    const j = raw as Record<string, unknown>;
    const dataNode = j['data'];
    if (!dataNode || typeof dataNode !== 'object')
      return {} as VaultKVv2Secret<Record<string, unknown>>;
    const inner = (dataNode as Record<string, unknown>)['data'];
    if (!inner || typeof inner !== 'object') return {} as VaultKVv2Secret<Record<string, unknown>>;
    return inner as VaultKVv2Secret<Record<string, unknown>>;
  }
}

export async function hydrateEnvFromVault(
  client: VaultClient,
  mappings: MappingEntry[],
  cacheTtlMs = CACHE_TTL_DEFAULT,
): Promise<void> {
  // group by path
  const now = Date.now();
  const cache = new Map<string, { ts: number; value?: Record<string, unknown> | null }>();

  const groups = new Map<string, MappingEntry[]>();
  for (const m of mappings) {
    const arr = groups.get(m.path) ?? [];
    arr.push(m);
    groups.set(m.path, arr);
  }

  for (const [path, entries] of groups.entries()) {
    try {
      const cached = cache.get(path);
      let data: Record<string, unknown> | null = null;
      if (cached && now - cached.ts < cacheTtlMs) {
        data = cached.value ?? null;
      } else {
        const read = await client.read(path);
        data = read ?? null;
        cache.set(path, { ts: Date.now(), value: data });
      }

      for (const e of entries) {
        try {
          // eslint-disable-next-line security/detect-object-injection -- accessing process.env by dynamic key is intentional
          if (process.env[e.envName]) continue; // do not overwrite existing env
          // Guard access to avoid object-injection issues
          let v: unknown = undefined;
          if (data && Object.prototype.hasOwnProperty.call(data, e.key)) {
            // eslint-disable-next-line security/detect-object-injection
            v = data[e.key];
          }
          if (v === undefined) {
            // eslint-disable-next-line no-console
            console.warn(
              `Warning: Vault secret for env ${e.envName} missing key ${e.key} at path ${path}`,
            );
            continue;
          }
          // eslint-disable-next-line security/detect-object-injection -- setting process.env by dynamic key is intentional
          process.env[e.envName] = String(v);
          // eslint-disable-next-line no-console
          console.info(`Vault: populated env ${e.envName} from ${path}#${e.key}`);
        } catch (innerErr) {
          // eslint-disable-next-line no-console
          console.warn(`Warning: failed to process mapping for ${e.envName} at ${path}:`, innerErr);
        }
      }
    } catch (err) {
      // read error non-fatal for now
      // eslint-disable-next-line no-console
      console.warn(`Warning: failed to read Vault path ${path}:`, err);
      // continue to other paths
    }
  }
}

export function assertRequiredEnv(vars: string[], opts: { fatal: boolean }) {
  // eslint-disable-next-line security/detect-object-injection -- iterating required env var names is intentional
  const missing = vars.filter((v) => !process.env[v]);
  if (missing.length === 0) return;
  if (opts.fatal) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
  // eslint-disable-next-line no-console
  console.warn(`Warning: missing required env vars: ${missing.join(', ')}`);
}

export function getRequiredEnvVarsFromConfig(): string[] {
  const raw = process.env.REQUIRED_ENV_VARS;
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function enforceRequiredEnv(
  requiredVars: string[],
  opts: { nodeEnv?: string | undefined; vaultFatal?: string | undefined },
): void {
  const isProd = opts.nodeEnv === 'production';
  const fatalFlag = opts.vaultFatal;
  const fatal = isProd && (fatalFlag === undefined || fatalFlag.toLowerCase() === 'true');
  assertRequiredEnv(requiredVars, { fatal });
}

export async function bootstrapVault(): Promise<void> {
  if (!VAULT_ADDR) return;

  // Build client
  const client = new HttpVaultClient();

  // Parse mapping
  const raw = process.env.VAULT_MAPPING;
  const mount = process.env.VAULT_MOUNT ?? DEFAULT_MOUNT;
  const prefix = process.env.VAULT_PREFIX;
  const mappings = parseVaultMapping(raw, { mount, prefix });

  if (mappings.length > 0) {
    await hydrateEnvFromVault(
      client,
      mappings,
      Number(process.env.VAULT_CACHE_TTL ?? CACHE_TTL_DEFAULT),
    );
  } else {
    // legacy behavior: populate well-known keys
    const wellKnown = [
      'DATABASE_URL',
      'POSTGRES_URL',
      'REDIS_URL',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
      'QSTASH_URL',
      'QSTASH_TOKEN',
      'QSTASH_CURRENT_SIGNING_KEY',
      'QSTASH_NEXT_SIGNING_KEY',
      'OPENAI_API_KEY',
      'JWT_SECRET',
      'API_KEY',
      'QDRANT_API_KEY',
      'SENTRY_DSN',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'CRON_SECRET',
      'ADMIN_API_KEY',
    ];
    const legacyMappings: MappingEntry[] = wellKnown.map((k) => {
      const rel =
        (process.env.VAULT_PREFIX ? `${prefixTrim(process.env.VAULT_PREFIX)}/` : '') +
        k.toLowerCase();
      const path = `${mount}/${rel}`;
      return { envName: k, path, key: k };
    });
    await hydrateEnvFromVault(
      client,
      legacyMappings,
      Number(process.env.VAULT_CACHE_TTL ?? CACHE_TTL_DEFAULT),
    );
  }

  // Enforcement of required env vars if configured
  try {
    const required = getRequiredEnvVarsFromConfig();
    if (required.length > 0) {
      const nodeEnv = process.env.NODE_ENV;
      const vaultFatal = process.env.VAULT_FATAL;
      enforceRequiredEnv(required, { nodeEnv, vaultFatal });
    }
  } catch (err) {
    // Non-fatal by design here; operator may choose to let this throw in later iteration.
    // eslint-disable-next-line no-console
    console.warn('Warning: required env enforcement raised an error:', err);
  }
}

export default bootstrapVault;

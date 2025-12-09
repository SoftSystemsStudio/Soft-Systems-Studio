/**
 * Types for reading secrets from HashiCorp Vault KV (version 2)
 *
 * These interfaces describe a minimal, well-typed request payload for
 * fetching a secret from a KV v2 mount and the typical shape of the
 * HTTP response returned by Vault's KV v2 API.
 */

export interface VaultKVv2ReadRequest {
  /**
   * The mount name where the KV v2 engine is mounted in Vault (e.g. `secret`).
   * This must not include the `data/` or `metadata/` segments that the KV v2
   * API uses internally.
   */
  mount: string;

  /**
   * The logical path (relative to the mount) of the secret to read.
   * Example: `service/api` to read from `/{mount}/data/service/api`.
   */
  path: string;

  /**
   * Optional specific field/key inside the secret's `data` object to return.
   * If omitted, the whole `data` object is returned.
   */
  key?: string;

  /**
   * Optional version to read (KV v2 supports versioned reads). If omitted,
   * Vault returns the latest version.
   */
  version?: number;

  /**
   * Optional per-request Vault token. If omitted, your client should use the
   * configured token or auth mechanism (AppRole, etc.).
   */
  token?: string;

  /**
   * Optional additional headers to send with the request (for advanced usage).
   */
  headers?: Record<string, string>;

  /**
   * Optional arbitrary metadata useful for client-side caching/logging.
   */
  meta?: {
    /** TTL in milliseconds for in-memory caching the result */
    cacheTtlMs?: number;
    /** optional correlation id for tracing */
    correlationId?: string;
  };
}

/**
 * The typical shape of a successful KV v2 read response from Vault.
 *
 * Vault returns an envelope with `data` which contains `data` (the secret
 * values) and `metadata` (version info, created_time, etc.). This generic
 * type captures that structure and lets callers type the secret shape `T`.
 */
export interface VaultKVv2ReadResponse<T = Record<string, unknown>> {
  request_id?: string;
  lease_duration?: number;
  renewable?: boolean;
  data: {
    data: T;
    metadata?: {
      version?: number;
      created_time?: string;
      deletion_time?: string | null;
      destroyed?: boolean;
    };
  };
}

/**
 * Example usage (pseudo-code):
 *
 * ```ts
 * const req: VaultKVv2ReadRequest = { mount: 'secret', path: 'service/api', key: 'API_KEY' };
 * const res = await httpClient.get<VaultKVv2ReadResponse<{ API_KEY: string }>>(
 *   `/v1/${req.mount}/data/${req.path}${req.version ? `?version=${req.version}` : ''}`,
 *   { headers: { 'X-Vault-Token': token } }
 * );
 * const value = req.key ? res.data.data[req.key] : res.data.data;
 * ```
 */

export type VaultKVv2Secret<T = Record<string, unknown>> = VaultKVv2ReadResponse<T>['data']['data'];

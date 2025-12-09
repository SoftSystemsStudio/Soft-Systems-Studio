import {
  parseVaultMapping,
  hydrateEnvFromVault,
  MappingEntry,
  VaultClient,
  assertRequiredEnv,
  getRequiredEnvVarsFromConfig,
  enforceRequiredEnv,
} from '../vault';

import { captureWarnings, captureWarningsAsync } from '../../test/utils';

class FakeVaultClient implements VaultClient {
  calls: string[] = [];
  constructor(private readonly data: Record<string, Record<string, unknown>>) {}

  // eslint-disable-next-line security/detect-object-injection
  read(path: string): Promise<Record<string, unknown>> {
    this.calls.push(path);
    const value = this.data[path];
    if (!value) {
      // Mirror real client behavior for "not found"
      throw new Error(`not found: ${path}`);
    }
    return Promise.resolve(value);
  }
}

describe('parseVaultMapping', () => {
  it('returns empty for undefined', () => {
    expect(parseVaultMapping(undefined, { mount: 'secret' })).toEqual([]);
  });

  it('parses valid mapping with prefix and mount', () => {
    const raw = JSON.stringify({
      DATABASE_URL: 'app/prod/db#DATABASE_URL',
      REDIS_URL: 'app/prod/redis#url',
    });
    const entries = parseVaultMapping(raw, { mount: 'secret', prefix: 'myteam' });
    expect(entries).toHaveLength(2);
    const paths = entries.map((e) => e.path).sort();
    expect(paths).toEqual(['secret/myteam/app/prod/db', 'secret/myteam/app/prod/redis'].sort());
    const found = entries.find((e) => e.envName === 'DATABASE_URL');
    expect(found).toBeDefined();
    if (!found) throw new Error('Expected DATABASE_URL mapping');
    expect(found.key).toBe('DATABASE_URL');
  });

  it('returns [] and warns on invalid JSON', () => {
    const warnings = captureWarnings(() => {
      const entries = parseVaultMapping('{not: json', { mount: 'secret' });
      expect(entries).toEqual([]);
    });
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('skips invalid entry formats', () => {
    const warnings = captureWarnings(() => {
      const raw = JSON.stringify({ DATABASE_URL: 'no-hash-delimiter', VALID: 'a/b#c' });
      const entries = parseVaultMapping(raw, { mount: 'secret' });
      expect(entries).toHaveLength(1);
      const found = entries[0];
      expect(found).toBeDefined();
      if (!found) throw new Error('Expected mapping entry');
      expect(found.envName).toBe('VALID');
    });
    expect(warnings.length).toBeGreaterThan(0);
  });
});

describe('hydrateEnvFromVault', () => {
  const origEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...origEnv };
  });

  it('hydrates envs and reads each path once', async () => {
    const mappings: MappingEntry[] = [
      { envName: 'DATABASE_URL', path: 'secret/app/prod/db', key: 'DATABASE_URL' },
      { envName: 'JWT_SECRET', path: 'secret/app/prod/jwt', key: 'secret' },
      { envName: 'REDIS_URL', path: 'secret/app/prod/db', key: 'redis' },
    ];
    const fake = new FakeVaultClient({
      'secret/app/prod/db': { DATABASE_URL: 'postgres://x', redis: 'redis://x' },
      'secret/app/prod/jwt': { secret: 'verysecret' },
    });

    await hydrateEnvFromVault(fake, mappings, 1000);
    expect(process.env.DATABASE_URL).toBe('postgres://x');
    expect(process.env.REDIS_URL).toBe('redis://x');
    expect(process.env.JWT_SECRET).toBe('verysecret');
    // read called for two distinct paths
    expect(fake.calls.filter((c) => c === 'secret/app/prod/db').length).toBe(1);
    expect(fake.calls.filter((c) => c === 'secret/app/prod/jwt').length).toBe(1);
  });

  it('preserves existing env values', async () => {
    process.env.DATABASE_URL = 'already';
    const mappings: MappingEntry[] = [
      { envName: 'DATABASE_URL', path: 'secret/app/prod/db', key: 'DATABASE_URL' },
    ];
    const fake = new FakeVaultClient({ 'secret/app/prod/db': { DATABASE_URL: 'postgres://x' } });
    await hydrateEnvFromVault(fake, mappings, 1000);
    expect(process.env.DATABASE_URL).toBe('already');
  });

  it('logs warning when key missing', async () => {
    const mappings: MappingEntry[] = [{ envName: 'MISSING', path: 'secret/x', key: 'nope' }];
    const fake = new FakeVaultClient({ 'secret/x': { something: 'x' } });
    const warnings = await captureWarningsAsync(() => hydrateEnvFromVault(fake, mappings, 1000));
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('continues when client.read throws', async () => {
    const mappings: MappingEntry[] = [
      { envName: 'A', path: 'secret/ok', key: 'a' },
      { envName: 'B', path: 'secret/missing', key: 'b' },
    ];
    const fake = new FakeVaultClient({ 'secret/ok': { a: '1' } });
    const warnings = await captureWarningsAsync(() => hydrateEnvFromVault(fake, mappings, 1000));
    expect(process.env.A).toBe('1');
    expect(warnings.length).toBeGreaterThan(0);
  });
});

describe('assertRequiredEnv', () => {
  const origEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...origEnv };
  });

  it('throws when fatal and missing', () => {
    delete process.env.FOO;
    expect(() => assertRequiredEnv(['FOO'], { fatal: true })).toThrow();
  });

  it('warns when non-fatal', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    delete process.env.FOO;
    expect(() => assertRequiredEnv(['FOO'], { fatal: false })).not.toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('REQUIRED_ENV_VARS enforcement', () => {
  const origEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...origEnv };
  });

  it('getRequiredEnvVarsFromConfig returns parsed list', () => {
    process.env.REQUIRED_ENV_VARS = 'A,B , C';
    expect(getRequiredEnvVarsFromConfig()).toEqual(['A', 'B', 'C']);
  });

  it('enforceRequiredEnv is non-fatal in non-prod', () => {
    delete process.env.FOO;
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() =>
      enforceRequiredEnv(['FOO'], { nodeEnv: 'development', vaultFatal: undefined }),
    ).not.toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('enforceRequiredEnv throws in prod by default', () => {
    delete process.env.FOO;
    expect(() =>
      enforceRequiredEnv(['FOO'], { nodeEnv: 'production', vaultFatal: undefined }),
    ).toThrow(/Missing required env vars/);
  });

  it('enforceRequiredEnv does not throw in prod when VAULT_FATAL=false', () => {
    delete process.env.FOO;
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() =>
      enforceRequiredEnv(['FOO'], { nodeEnv: 'production', vaultFatal: 'false' }),
    ).not.toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('enforceRequiredEnv does not throw when vars present', () => {
    process.env.FOO = 'bar';
    expect(() =>
      enforceRequiredEnv(['FOO'], { nodeEnv: 'production', vaultFatal: undefined }),
    ).not.toThrow();
  });
});

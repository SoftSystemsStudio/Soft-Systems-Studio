/* eslint-disable no-restricted-syntax -- tests intentionally manipulate process.env */
import { hydrateSecretsIntoProcessEnv, readSecretsFromVault, MappingEntry } from '../vault';

class FakeVaultClient {
  constructor(private readonly data: Record<string, Record<string, unknown>>) {}
  read(path: string) {
    const v = this.data[path];
    if (!v) throw new Error('not found');
    return Promise.resolve(v as Record<string, unknown>);
  }
}

describe('vault hardening: hydrateSecretsIntoProcessEnv', () => {
  const mount = 'secret';
  const mappings: MappingEntry[] = [
    { envName: 'A', path: `${mount}/one`, key: 'A' },
    { envName: 'B', path: `${mount}/one`, key: 'B' },
    { envName: 'C', path: `${mount}/two`, key: 'C' },
  ];

  const client = new FakeVaultClient({
    [`${mount}/one`]: { A: '1', B: '2' },
    [`${mount}/two`]: { C: '3' },
  });

  beforeEach(() => {
    delete process.env.A;
    delete process.env.B;
    delete process.env.C;
  });

  it('reads secrets without mutating using readSecretsFromVault', async () => {
    const r = await readSecretsFromVault(client as any, mappings, 1000);
    expect(r.A).toBe('1');
    expect(r.B).toBe('2');
    expect(r.C).toBe('3');
    expect(process.env.A).toBeUndefined();
  });

  it('hydrates process.env idempotently and respects allowlist', async () => {
    process.env.A = 'existing';
    await hydrateSecretsIntoProcessEnv(client as any, mappings, { overwrite: false });
    expect(process.env.A).toBe('existing');
    expect(process.env.B).toBe('2');
    expect(process.env.C).toBe('3');

    // allowlist restricts written keys
    delete process.env.B;
    await hydrateSecretsIntoProcessEnv(client as any, mappings, {
      overwrite: true,
      allowlist: ['B'],
    });
    expect(process.env.B).toBe('2');
    // other keys untouched when allowlist present
    expect(process.env.C).toBe('3');
  });
});

import { registerToolValidator, validateToolArgs } from '../toolValidator';

describe('toolValidator', () => {
  test('accepts when no validator registered', () => {
    const res = validateToolArgs('no-such-tool', { foo: 'bar' });
    expect(res).toEqual({ ok: true, parsed: { foo: 'bar' } });
  });

  test('registers and validates with custom validator', () => {
    registerToolValidator('echo', (args: any) => {
      if (typeof args === 'object' && args && (args as any).text) return { ok: true, parsed: args };
      return { ok: false, errors: ['text required'] };
    });

    const good = validateToolArgs('echo', { text: 'hello' });
    expect(good.ok).toBe(true);
    const bad = validateToolArgs('echo', { no: 'field' });
    expect(bad.ok).toBe(false);
    expect(Array.isArray((bad as any).errors)).toBe(true);
  });
});

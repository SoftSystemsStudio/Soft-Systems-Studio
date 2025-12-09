/**
 * Lightweight tool validator registry. Register a validation function which returns
 * { ok: true, parsed } or { ok: false, errors: string[] }.
 */
type ValidatorFn = (
  args: unknown,
) => { ok: true; parsed: unknown } | { ok: false; errors: string[] };
const registry: Record<string, ValidatorFn> = {};

export function registerToolValidator(name: string, fn: ValidatorFn) {
  registry[name] = fn;
}

export function validateToolArgs(
  name: string,
  args: unknown,
): { ok: true; parsed: unknown } | { ok: false; errors: string[] } {
  const v = registry[name];
  if (!v) return { ok: true, parsed: args };
  try {
    return v(args);
  } catch (err: any) {
    return { ok: false, errors: [(err && err.message) || String(err)] };
  }
}

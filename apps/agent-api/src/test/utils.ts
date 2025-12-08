export function withEnv<T>(overrides: NodeJS.ProcessEnv, fn: () => T): T {
  const originalEnv = process.env;
  process.env = { ...process.env, ...overrides };
  try {
    return fn();
  } finally {
    process.env = originalEnv;
  }
}

export function withEnvAsync<T>(overrides: NodeJS.ProcessEnv, fn: () => Promise<T>): Promise<T> {
  const originalEnv = process.env;
  process.env = { ...process.env, ...overrides };
  return fn().finally(() => {
    process.env = originalEnv;
  });
}

export function captureWarnings(run: () => void): string[] {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    run();
    return warnSpy.mock.calls.map(([first]) => String(first));
  } finally {
    warnSpy.mockRestore();
  }
}

export async function captureWarningsAsync(run: () => Promise<unknown>): Promise<string[]> {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    await run();
    return warnSpy.mock.calls.map(([first]) => String(first));
  } finally {
    warnSpy.mockRestore();
  }
}

export type TestUtils = typeof import('./utils');

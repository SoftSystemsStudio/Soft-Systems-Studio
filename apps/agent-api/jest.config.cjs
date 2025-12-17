/**
 * Local Jest config (CommonJS) for `apps/agent-api` so tests run in the
 * package without needing to load the TypeScript root config file.
 *
 * Key: Ignores `dist/` to prevent running compiled tests twice.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  // Ignore compiled output to avoid running tests from `dist/`
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  modulePathIgnorePatterns: ['/dist/'],
};

/**
 * Local Jest config (CommonJS) for `apps/agent-api` so tests run in the
 * package without needing to load the TypeScript root config file.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
};

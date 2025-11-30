import { cleanEnv, str, port } from 'envalid';

// Validate environment variables at startup. Throws helpful errors and exits process on failure.
export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  PORT: port({ default: 5000 }),
  POSTGRES_URL: str(),
  OPENAI_API_KEY: str(),
  REDIS_URL: str({ default: 'redis://localhost:6379' }),
  JWT_SECRET: str({ default: '' }),
  JWT_ALGORITHM: str({ choices: ['HS256', 'HS384', 'HS512'], default: 'HS256' }),
});

export default env;

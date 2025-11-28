import { cleanEnv, str, port } from 'envalid';

// Validate environment variables at startup. Throws helpful errors and exits process on failure.
export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  PORT: port({ default: 5000 }),
  POSTGRES_URL: str(),
  OPENAI_API_KEY: str()
});

export default env;

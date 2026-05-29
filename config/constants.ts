function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const APP_BASE_URL = process.env.APP_BASE_URL ?? 'http://localhost:8081';
export const ADMIN_PASSWORD = requireEnv('ADMIN_PASSWORD');

import { loadEnvFile } from 'node:process';

try {
  loadEnvFile('.env');
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
    throw error;
  }
}

export const APP_BASE_URL = (process.env.APP_BASE_URL ?? 'http://localhost:8081').replace(/\/+$/, '');
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example to .env and fill it in (see README).`);
  }
  return value;
}

export const ADMIN_USERNAME = requireEnv('ADMIN_USERNAME');
export const ADMIN_PASSWORD = requireEnv('ADMIN_PASSWORD');

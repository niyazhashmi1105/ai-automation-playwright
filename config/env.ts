import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

/**
 * Typed environment loader.
 * Precedence (highest first): process.env > .env > config/env/.env.<TEST_ENV>
 * dotenv never overwrites keys that are already set, so loading in this order
 * gives the precedence above.
 */
const ROOT = path.resolve(__dirname, '..');

// CI maps missing secrets to empty strings (GitHub: WEB_PASSWORD: ${{ secrets.X }}) or, in
// Azure Pipelines, to the unexpanded macro text "$(WEB_PASSWORD)". dotenv never overrides an
// existing key, so drop those values first and let .env / config/env defaults fill them.
const UNSET_CI_VALUE = /^(|\$\([\w.]+\))$/;
for (const key of ['WEB_BASE_URL', 'API_BASE_URL', 'WEB_USERNAME', 'WEB_PASSWORD', 'API_TOKEN', 'TEST_ENV', 'LOG_LEVEL']) {
  const value = process.env[key];
  if (value !== undefined && UNSET_CI_VALUE.test(value)) delete process.env[key];
}

dotenv.config({ path: path.join(ROOT, '.env'), quiet: true });

export const TEST_ENVS = ['qa', 'staging'] as const;
export type TestEnv = (typeof TEST_ENVS)[number];

const rawEnv = (process.env.TEST_ENV ?? 'qa').toLowerCase();
if (!TEST_ENVS.includes(rawEnv as TestEnv)) {
  throw new Error(`Unknown TEST_ENV "${rawEnv}". Expected one of: ${TEST_ENVS.join(', ')}`);
}
const testEnv = rawEnv as TestEnv;

const envFile = path.join(ROOT, 'config', 'env', `.env.${testEnv}`);
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile, quiet: true });
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name} (TEST_ENV=${testEnv})`);
  return value;
}

function optional(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

function bool(name: string, fallback = false): boolean {
  const v = process.env[name];
  if (v === undefined || v === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
}

export interface EnvConfig {
  testEnv: TestEnv;
  webBaseUrl: string;
  apiBaseUrl: string;
  webUsername: string;
  /** Secret. Empty when not provided; the auth setup fails with a clear message. */
  webPassword: string;
  /** Secret. Optional — sent as Bearer when present. */
  apiToken: string;
  isCI: boolean;
  extraBrowsers: boolean;
  logLevel: string;
}

export const env: EnvConfig = Object.freeze({
  testEnv,
  webBaseUrl: required('WEB_BASE_URL'),
  apiBaseUrl: required('API_BASE_URL'),
  webUsername: optional('WEB_USERNAME', 'standard_user'),
  webPassword: optional('WEB_PASSWORD'),
  apiToken: optional('API_TOKEN'),
  isCI: bool('CI'),
  extraBrowsers: bool('EXTRA_BROWSERS'),
  logLevel: optional('LOG_LEVEL', 'info'),
});

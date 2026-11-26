import fs from 'node:fs';
import path from 'node:path';
import { TEST_DATA_DIR } from '../../config/constants';
import { env } from '../../config/env';
import { randomEmail, randomFirstName, randomLastName, randomPostalCode, uniqueId } from './randomData';

const cache = new Map<string, unknown>();

/**
 * Read a JSON file from test-data/. If test-data/<TEST_ENV>/<file> exists it
 * wins over the shared file. Results are cached and returned as a deep clone,
 * so a test can mutate its copy safely. String values containing
 * {{placeholder}} are resolved (see resolvePlaceholders).
 */
export function readJson<T>(file: string, opts: { resolve?: boolean } = {}): T {
  const name = file.endsWith('.json') ? file : `${file}.json`;
  const envPath = path.join(TEST_DATA_DIR, env.testEnv, name);
  const sharedPath = path.join(TEST_DATA_DIR, name);
  const fullPath = fs.existsSync(envPath) ? envPath : sharedPath;

  if (!cache.has(fullPath)) {
    if (!fs.existsSync(fullPath)) throw new Error(`Test data file not found: ${name} (looked in ${envPath} and ${sharedPath})`);
    cache.set(fullPath, JSON.parse(fs.readFileSync(fullPath, 'utf-8')));
  }
  const copy = structuredClone(cache.get(fullPath)) as T;
  return opts.resolve === false ? copy : resolvePlaceholders(copy);
}

type Generator = () => string;

const GENERATORS: Record<string, Generator> = {
  uniqueId: () => uniqueId(),
  firstName: randomFirstName,
  lastName: randomLastName,
  postalCode: randomPostalCode,
  email: () => randomEmail(),
  timestamp: () => String(Date.now()),
};

/**
 * Replace {{name}} tokens in every string of a value.
 * Lookup order: extra vars > generators above > env:VAR (process.env).
 * Unknown tokens are left untouched so the failure is visible.
 */
export function resolvePlaceholders<T>(value: T, vars: Record<string, string> = {}): T {
  const resolveString = (s: string): string =>
    s.replace(/\{\{\s*([\w:.-]+)\s*\}\}/g, (whole, key: string) => {
      if (key in vars) return vars[key];
      if (key in GENERATORS) return GENERATORS[key]();
      if (key.startsWith('env:')) return process.env[key.slice(4)] ?? whole;
      return whole;
    });

  const walk = (v: unknown): unknown => {
    if (typeof v === 'string') return resolveString(v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') {
      return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, walk(x)]));
    }
    return v;
  };
  return walk(value) as T;
}

/** For unit-style tests of the reader itself. */
export function clearDataCache(): void {
  cache.clear();
}

import { test } from '@playwright/test';

/**
 * Wrap work in a named report step. Use inside page objects and API clients
 * so the HTML report reads as user intent.
 */
export async function step<T>(title: string, body: () => Promise<T>, opts?: { box?: boolean }): Promise<T> {
  return test.step(title, body, { box: opts?.box ?? true });
}

/** "$29.99" | "Item total: $29.99" -> 29.99 */
export function parsePrice(text: string): number {
  const match = text.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  if (!match) throw new Error(`No price found in "${text}"`);
  return Number(match[0]);
}

/** Round to cents to avoid floating point noise when comparing money. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function sum(values: number[]): number {
  return roundMoney(values.reduce((a, b) => a + b, 0));
}

export function isSortedAsc<T>(items: T[], compare: (a: T, b: T) => number = defaultCompare): boolean {
  return items.every((v, i) => i === 0 || compare(items[i - 1], v) <= 0);
}

export function isSortedDesc<T>(items: T[], compare: (a: T, b: T) => number = defaultCompare): boolean {
  return items.every((v, i) => i === 0 || compare(items[i - 1], v) >= 0);
}

function defaultCompare<T>(a: T, b: T): number {
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Retry an async operation with linear backoff. For flaky *external setup*
 * (e.g. seeding via API) — never to paper over a UI wait; use web-first
 * assertions for that.
 */
export async function retry<T>(fn: () => Promise<T>, opts: { attempts?: number; delayMs?: number } = {}): Promise<T> {
  const attempts = opts.attempts ?? 3;
  const delayMs = opts.delayMs ?? 500;
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts) await new Promise((r) => setTimeout(r, delayMs * i));
    }
  }
  throw lastError;
}

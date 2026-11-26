/** Dependency-free random test data. Unique per call, safe for parallel workers. */
const FIRST = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Riley', 'Casey', 'Morgan', 'Quinn'];
const LAST = ['Lee', 'Patel', 'Garcia', 'Kim', 'Nguyen', 'Smith', 'Khan', 'Silva'];

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)];
}

export function uniqueId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function randomString(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[randomInt(0, chars.length - 1)]).join('');
}

export function randomFirstName(): string {
  return pick(FIRST);
}

export function randomLastName(): string {
  return pick(LAST);
}

export function randomPostalCode(): string {
  return String(randomInt(10000, 99999));
}

export function randomEmail(domain = 'example.test'): string {
  return `${uniqueId('user')}@${domain}`;
}

export function randomSentence(words = 6): string {
  const s = Array.from({ length: words }, () => randomString(randomInt(3, 8))).join(' ');
  return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}

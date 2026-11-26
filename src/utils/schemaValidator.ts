/**
 * Light JSON shape validation — no dependencies. Enough for API contract
 * checks: types, required keys, nested objects, arrays.
 *
 * Schema examples:
 *   'number' | 'string' | 'boolean' | 'any' | 'string?' (optional / nullable)
 *   { id: 'number', address: { city: 'string' } }
 *   ['number']            -> array of numbers
 */
export type PrimitiveType = 'string' | 'number' | 'boolean' | 'object' | 'any';
export type SchemaType = PrimitiveType | `${PrimitiveType}?`;
export type Schema = SchemaType | { [key: string]: Schema } | [Schema];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateSchema(value: unknown, schema: Schema, at = '$'): ValidationResult {
  const errors: string[] = [];
  check(value, schema, at, errors);
  return { valid: errors.length === 0, errors };
}

function typeOf(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

function check(value: unknown, schema: Schema, at: string, errors: string[]): void {
  if (typeof schema === 'string') {
    const optional = schema.endsWith('?');
    const base = (optional ? schema.slice(0, -1) : schema) as PrimitiveType;
    if (value === undefined || value === null) {
      if (!optional) errors.push(`${at}: expected ${base}, got ${typeOf(value)}`);
      return;
    }
    if (base === 'any') return;
    if (base === 'object' ? typeOf(value) !== 'object' : typeof value !== base) {
      errors.push(`${at}: expected ${base}, got ${typeOf(value)}`);
    }
    return;
  }

  if (Array.isArray(schema)) {
    if (!Array.isArray(value)) {
      errors.push(`${at}: expected array, got ${typeOf(value)}`);
      return;
    }
    value.forEach((item, i) => check(item, schema[0], `${at}[${i}]`, errors));
    return;
  }

  if (typeOf(value) !== 'object') {
    errors.push(`${at}: expected object, got ${typeOf(value)}`);
    return;
  }
  const obj = value as Record<string, unknown>;
  for (const [key, sub] of Object.entries(schema)) {
    check(obj[key], sub, `${at}.${key}`, errors);
  }
}

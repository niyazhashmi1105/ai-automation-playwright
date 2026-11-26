import type { APIRequestContext, APIResponse } from '@playwright/test';
import { createLogger, type Logger } from '../utils/logger';
import { step } from '../utils/helpers';

export interface ApiResponse<T> {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  body: T;
  durationMs: number;
}

export type Query = Record<string, string | number | boolean>;

export interface RequestOptions {
  params?: Query;
  headers?: Record<string, string>;
  data?: unknown;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Thin typed wrapper around APIRequestContext. Every call is logged, timed,
 * and shown as a step in the report. Never throws on non-2xx — tests assert
 * on `status` so negative cases stay readable.
 */
export abstract class BaseApiClient {
  protected readonly log: Logger;

  constructor(
    protected readonly request: APIRequestContext,
    /** Resource path, e.g. "/posts". */
    protected readonly basePath: string,
  ) {
    this.log = createLogger('api').child(this.constructor.name);
  }

  protected get<T>(path = '', opts: RequestOptions = {}) {
    return this.send<T>('GET', path, opts);
  }

  protected post<T>(path = '', data?: unknown, opts: RequestOptions = {}) {
    return this.send<T>('POST', path, { ...opts, data });
  }

  protected put<T>(path = '', data?: unknown, opts: RequestOptions = {}) {
    return this.send<T>('PUT', path, { ...opts, data });
  }

  protected patch<T>(path = '', data?: unknown, opts: RequestOptions = {}) {
    return this.send<T>('PATCH', path, { ...opts, data });
  }

  protected delete<T>(path = '', opts: RequestOptions = {}) {
    return this.send<T>('DELETE', path, opts);
  }

  private async send<T>(method: Method, path: string, opts: RequestOptions): Promise<ApiResponse<T>> {
    const url = `${this.basePath}${path}`;
    const label = `${method} ${url}${opts.params ? ` ${JSON.stringify(opts.params)}` : ''}`;
    return step(label, async () => {
      const started = performance.now();
      const res = await this.request.fetch(url, {
        method,
        params: opts.params,
        headers: opts.headers,
        data: opts.data,
      });
      const durationMs = Math.round(performance.now() - started);
      const body = (await parseBody(res)) as T;
      this.log.info(`${label} -> ${res.status()} (${durationMs}ms)`);
      this.log.debug('response body', body);
      return { status: res.status(), ok: res.ok(), headers: res.headers(), body, durationMs };
    });
  }
}

async function parseBody(res: APIResponse): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  const type = res.headers()['content-type'] ?? '';
  if (type.includes('json')) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

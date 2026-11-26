/** Leveled, scoped logger. Level comes from LOG_LEVEL (debug|info|warn|error|silent). */
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 } as const;
export type LogLevel = keyof typeof LEVELS;

function currentLevel(): number {
  const raw = (process.env.LOG_LEVEL ?? 'info').toLowerCase() as LogLevel;
  return LEVELS[raw] ?? LEVELS.info;
}

export interface Logger {
  debug(msg: string, meta?: unknown): void;
  info(msg: string, meta?: unknown): void;
  warn(msg: string, meta?: unknown): void;
  error(msg: string, meta?: unknown): void;
  child(scope: string): Logger;
}

export function createLogger(scope = 'e2e'): Logger {
  const write = (level: Exclude<LogLevel, 'silent'>, msg: string, meta?: unknown) => {
    if (LEVELS[level] < currentLevel()) return;
    const line = `${new Date().toISOString()} ${level.toUpperCase().padEnd(5)} [${scope}] ${msg}`;
    const out = level === 'error' || level === 'warn' ? console.error : console.log;
    if (meta === undefined) out(line);
    else out(line, typeof meta === 'string' ? meta : JSON.stringify(meta));
  };
  return {
    debug: (m, meta) => write('debug', m, meta),
    info: (m, meta) => write('info', m, meta),
    warn: (m, meta) => write('warn', m, meta),
    error: (m, meta) => write('error', m, meta),
    child: (sub) => createLogger(`${scope}:${sub}`),
  };
}

export const logger = createLogger();

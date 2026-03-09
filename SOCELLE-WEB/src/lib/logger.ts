/**
 * Structured Logger
 * that can be stripped from production builds via Vite's define.
 *
 * Usage:
 *   import { logger } from './logger';
 *   logger.info('Component loaded', { brandId });
 *   logger.error('Query failed', { error, table: 'protocols' });
 *   logger.warn('Missing data', { field: 'duration' });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  source?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const IS_DEV = import.meta.env.DEV;
const MIN_LEVEL: LogLevel = IS_DEV ? 'debug' : 'warn';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatEntry(entry: LogEntry): string {
  const ctx = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
  const src = entry.source ? `[${entry.source}]` : '';
  return `${entry.timestamp} [${entry.level.toUpperCase()}]${src} ${entry.message}${ctx}`;
}

function createLogMethod(level: LogLevel) {
  return (message: string, context?: Record<string, unknown>, source?: string) => {
    if (!shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      source,
    };

    const formatted = formatEntry(entry);

    switch (level) {
      case 'debug':
        // Only in dev, stripped from prod
        if (IS_DEV) console.debug(formatted);
        break;
      case 'info':
        if (IS_DEV) console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        // Future: send to error reporting service
        break;
    }
  };
}

export const logger = {
  debug: createLogMethod('debug'),
  info: createLogMethod('info'),
  warn: createLogMethod('warn'),
  error: createLogMethod('error'),
};

/**
 * Create a scoped logger for a specific module.
 * All log entries will include the source name.
 *
 * Usage:
 *   const log = createScopedLogger('PlanWizard');
 *   log.info('Step completed', { step: 2 });
 */
export function createScopedLogger(source: string) {
  return {
    debug: (message: string, context?: Record<string, unknown>) =>
      logger.debug(message, context, source),
    info: (message: string, context?: Record<string, unknown>) =>
      logger.info(message, context, source),
    warn: (message: string, context?: Record<string, unknown>) =>
      logger.warn(message, context, source),
    error: (message: string, context?: Record<string, unknown>) =>
      logger.error(message, context, source),
  };
}

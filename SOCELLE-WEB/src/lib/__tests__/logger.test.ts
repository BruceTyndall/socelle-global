import { describe, it, expect, vi, beforeEach } from 'vitest';

// Logger reads import.meta.env.DEV at module load time.
// setup.ts sets DEV=true, so all log levels should fire.

import { logger, createScopedLogger } from '../logger';

describe('logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls console.error for error level', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    logger.error('test error message', { detail: 'some-detail' });

    expect(spy).toHaveBeenCalledTimes(1);
    const loggedStr = spy.mock.calls[0][0] as string;
    expect(loggedStr).toContain('[ERROR]');
    expect(loggedStr).toContain('test error message');
    expect(loggedStr).toContain('some-detail');
  });

  it('calls console.warn for warn level', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    logger.warn('test warning');

    expect(spy).toHaveBeenCalledTimes(1);
    const loggedStr = spy.mock.calls[0][0] as string;
    expect(loggedStr).toContain('[WARN]');
    expect(loggedStr).toContain('test warning');
  });

  it('calls console.debug for debug level in DEV mode', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    logger.debug('debug message');

    expect(spy).toHaveBeenCalledTimes(1);
    const loggedStr = spy.mock.calls[0][0] as string;
    expect(loggedStr).toContain('[DEBUG]');
    expect(loggedStr).toContain('debug message');
  });

  it('createScopedLogger includes source in output', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const log = createScopedLogger('TestModule');
    log.error('scoped error');

    expect(spy).toHaveBeenCalledTimes(1);
    const loggedStr = spy.mock.calls[0][0] as string;
    expect(loggedStr).toContain('[TestModule]');
    expect(loggedStr).toContain('scoped error');
  });
});

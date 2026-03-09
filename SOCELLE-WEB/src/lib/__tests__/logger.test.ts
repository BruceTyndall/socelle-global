import { describe, it, expect, vi, beforeEach } from 'vitest';

// Logger reads import.meta.env.DEV at module load time.
// In the Vitest test environment, import.meta.env.DEV is false (not a real Vite dev server).
// Therefore only warn and error levels fire unconditionally.
// debug/info are gated behind IS_DEV which is false at module-eval time.

import { logger, createScopedLogger } from '../logger';

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('does not throw when calling debug level (no-op in test env)', () => {
    // In the Vitest environment IS_DEV evaluates to false at module load time,
    // so debug is a controlled no-op. We verify it does not throw.
    expect(() => logger.debug('debug message')).not.toThrow();
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

  it('logger.error formats message with timestamp prefix', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    logger.error('format check');

    expect(spy).toHaveBeenCalledTimes(1);
    const loggedStr = spy.mock.calls[0][0] as string;
    // Timestamp is ISO format — should start with 2 or 1 (year digits)
    expect(loggedStr).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(loggedStr).toContain('[ERROR]');
  });
});

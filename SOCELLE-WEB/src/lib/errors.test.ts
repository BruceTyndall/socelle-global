import { describe, it, expect } from 'vitest';
import { AppError, getErrorMessage, getUserMessage, isRetryableError } from './errors';

describe('AppError', () => {
  it('creates error with defaults', () => {
    const err = new AppError({ message: 'test' });
    expect(err.message).toBe('test');
    expect(err.code).toBe('UNKNOWN');
    expect(err.userMessage).toBe('Something went wrong. Please try again.');
    expect(err.isRetryable).toBe(false);
    expect(err.name).toBe('AppError');
  });

  it('creates error with custom fields', () => {
    const err = new AppError({
      message: 'DB down',
      code: 'DB_ERROR',
      userMessage: 'Service unavailable',
      isRetryable: true,
    });
    expect(err.code).toBe('DB_ERROR');
    expect(err.userMessage).toBe('Service unavailable');
    expect(err.isRetryable).toBe(true);
  });

  it('is instanceof Error', () => {
    const err = new AppError({ message: 'test' });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('getErrorMessage', () => {
  it('returns userMessage for AppError', () => {
    const err = new AppError({ message: 'internal', userMessage: 'User-facing' });
    expect(getErrorMessage(err)).toBe('User-facing');
  });

  it('returns message for standard Error', () => {
    expect(getErrorMessage(new Error('standard'))).toBe('standard');
  });

  it('returns string errors directly', () => {
    expect(getErrorMessage('oops')).toBe('oops');
  });

  it('returns fallback for unknown types', () => {
    expect(getErrorMessage(42)).toBe('An unexpected error occurred.');
  });
});

describe('getUserMessage', () => {
  it('returns userMessage for AppError', () => {
    const err = new AppError({ message: 'internal', userMessage: 'Friendly' });
    expect(getUserMessage(err)).toBe('Friendly');
  });

  it('hides technical details from standard errors', () => {
    expect(getUserMessage(new Error('SQL injection failed'))).toBe(
      'Something went wrong. Please try again.',
    );
  });
});

describe('isRetryableError', () => {
  it('returns true for retryable AppError', () => {
    const err = new AppError({ message: 'net', isRetryable: true });
    expect(isRetryableError(err)).toBe(true);
  });

  it('returns false for non-retryable AppError', () => {
    const err = new AppError({ message: 'perm', isRetryable: false });
    expect(isRetryableError(err)).toBe(false);
  });

  it('returns false for non-AppError', () => {
    expect(isRetryableError(new Error('test'))).toBe(false);
    expect(isRetryableError('string')).toBe(false);
  });
});

/**
 * Error Handling Utilities
 * Provides consistent error mapping, user-friendly messages,
 * and typed error extraction for Supabase + React apps.
 */

import { SUPABASE_ERROR_MAP } from './platformConfig';
import { logger } from './logger';

// ─── App Error Class ─────────────────────────────────────────────
export class AppError extends Error {
  public readonly code: string;
  public readonly userMessage: string;
  public readonly isRetryable: boolean;
  public readonly originalError?: unknown;

  constructor(opts: {
    message: string;
    code?: string;
    userMessage?: string;
    isRetryable?: boolean;
    originalError?: unknown;
  }) {
    super(opts.message);
    this.name = 'AppError';
    this.code = opts.code ?? 'UNKNOWN';
    this.userMessage = opts.userMessage ?? 'Something went wrong. Please try again.';
    this.isRetryable = opts.isRetryable ?? false;
    this.originalError = opts.originalError;
  }
}

// ─── Supabase Error Mapping ──────────────────────────────────────
interface SupabaseError {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}

/**
 * Maps a Supabase error to a user-friendly message.
 * Logs the technical error for debugging.
 */
export function mapSupabaseError(
  error: SupabaseError | null | undefined,
  context?: string
): AppError {
  if (!error) {
    return new AppError({
      message: 'Unknown error',
      userMessage: 'An unexpected error occurred.',
    });
  }

  const code = error.code ?? '';
  const message = error.message ?? '';
  const lowerMessage = message.toLowerCase();

  logger.error(`Supabase error${context ? ` in ${context}` : ''}`, {
    code,
    message,
    details: error.details,
    hint: error.hint,
  });

  // Check error code map first
  if (code && SUPABASE_ERROR_MAP[code]) {
    return new AppError({
      message,
      code,
      userMessage: SUPABASE_ERROR_MAP[code],
      isRetryable: false,
      originalError: error,
    });
  }

  // Permission / RLS errors
  if (
    lowerMessage.includes('permission') ||
    lowerMessage.includes('rls') ||
    lowerMessage.includes('row-level security')
  ) {
    return new AppError({
      message,
      code: 'PERMISSION_DENIED',
      userMessage: 'You do not have permission to access this resource.',
      isRetryable: false,
      originalError: error,
    });
  }

  // Network errors
  if (
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('network') ||
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('timeout')
  ) {
    return new AppError({
      message,
      code: 'NETWORK_ERROR',
      userMessage: 'Network issue. Please check your connection and try again.',
      isRetryable: true,
      originalError: error,
    });
  }

  // Unique constraint
  if (lowerMessage.includes('duplicate') || code === '23505') {
    return new AppError({
      message,
      code: 'DUPLICATE',
      userMessage: 'This record already exists.',
      isRetryable: false,
      originalError: error,
    });
  }

  // Generic fallback
  return new AppError({
    message,
    code: code || 'UNKNOWN',
    userMessage: 'Something went wrong. Please try again.',
    isRetryable: true,
    originalError: error,
  });
}

// ─── Error Extraction Helpers ────────────────────────────────────

/**
 * Safely extract an error message from any caught error.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.userMessage;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred.';
}

/**
 * Safely extract a user-facing message from any caught error.
 */
export function getUserMessage(error: unknown): string {
  if (error instanceof AppError) return error.userMessage;
  if (error instanceof Error) {
    // Never show raw technical errors to users
    return 'Something went wrong. Please try again.';
  }
  return 'An unexpected error occurred.';
}

/**
 * Type guard for checking if error is retryable.
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) return error.isRetryable;
  return false;
}

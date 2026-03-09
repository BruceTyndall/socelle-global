/**
 * Error handling for Supabase Edge Functions (Deno).
 *
 * Sentry has been removed (2026-03-09). All errors are logged to console.
 * Observability is via Admin Hub dashboards and Supabase logs.
 *
 * Usage in any edge function:
 *   import { captureException, withErrorHandler } from '../_shared/sentry.ts';
 *
 *   Deno.serve(withErrorHandler(async (req) => {
 *     // ... your handler
 *     return new Response(JSON.stringify({ ok: true }));
 *   }));
 */

/**
 * Log an error to console for Admin Hub observability.
 * Drop-in replacement for former Sentry captureException.
 */
export async function captureException(
  error: unknown,
  context?: { tags?: Record<string, string>; extra?: Record<string, unknown> }
): Promise<void> {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error('[EdgeFn Error]', {
    message: err.message,
    stack: err.stack,
    tags: context?.tags,
    extra: context?.extra,
  });
}

/**
 * Wrap a Deno.serve handler with error capture.
 * Drop-in replacement for former withSentry wrapper.
 */
export function withSentry(
  handler: (req: Request) => Promise<Response> | Response,
  fnName?: string
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      await captureException(error, {
        tags: {
          edge_function: fnName || 'unknown',
          method: req.method,
          path: new URL(req.url).pathname,
        },
      });
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

/** Alias for withSentry — preferred name post-Sentry removal */
export const withErrorHandler = withSentry;

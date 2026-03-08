/**
 * Sentry integration for Supabase Edge Functions (Deno).
 *
 * Usage in any edge function:
 *   import { captureException, withSentry } from '../_shared/sentry.ts';
 *
 *   Deno.serve(withSentry(async (req) => {
 *     // ... your handler
 *     return new Response(JSON.stringify({ ok: true }));
 *   }));
 *
 * Set SENTRY_DSN_EDGE in Supabase secrets to enable.
 * When SENTRY_DSN_EDGE is not set, errors are logged to console only.
 */

const SENTRY_DSN = Deno.env.get('SENTRY_DSN_EDGE') || '';
const ENVIRONMENT = Deno.env.get('ENVIRONMENT') || 'production';

interface SentryEvent {
  exception: {
    values: Array<{
      type: string;
      value: string;
      stacktrace?: { frames: Array<{ filename: string; lineno?: number; function?: string }> };
    }>;
  };
  level: string;
  platform: string;
  environment: string;
  timestamp: number;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

function parseDsn(dsn: string): { publicKey: string; host: string; projectId: string } | null {
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace('/', '');
    return {
      publicKey: url.username,
      host: url.hostname,
      projectId,
    };
  } catch {
    return null;
  }
}

/**
 * Send an error to Sentry via the HTTP envelope API.
 */
export async function captureException(
  error: unknown,
  context?: { tags?: Record<string, string>; extra?: Record<string, unknown> }
): Promise<void> {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error('[EdgeFn Error]', err.message, err.stack);

  if (!SENTRY_DSN) return;

  const parsed = parseDsn(SENTRY_DSN);
  if (!parsed) return;

  const event: SentryEvent = {
    exception: {
      values: [{
        type: err.name,
        value: err.message,
        stacktrace: err.stack ? {
          frames: err.stack.split('\n').slice(1).map((line) => ({
            filename: line.trim(),
            function: line.trim().split(' ')[1] || '<anonymous>',
          })),
        } : undefined,
      }],
    },
    level: 'error',
    platform: 'javascript',
    environment: ENVIRONMENT,
    timestamp: Date.now() / 1000,
    tags: context?.tags,
    extra: context?.extra,
  };

  const envelope = [
    JSON.stringify({ dsn: SENTRY_DSN, sent_at: new Date().toISOString() }),
    JSON.stringify({ type: 'event' }),
    JSON.stringify(event),
  ].join('\n');

  try {
    await fetch(`https://${parsed.host}/api/${parsed.projectId}/envelope/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-sentry-envelope' },
      body: envelope,
    });
  } catch {
    // Silently fail — Sentry reporting should never break the edge function
  }
}

/**
 * Wrap a Deno.serve handler with Sentry error capture.
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

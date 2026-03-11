/**
 * Rate-limiting utilities for Supabase Edge Functions.
 *
 * Wraps the `check_rate_limit` RPC and provides tier→limit mapping.
 */

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { jsonResponse } from './cors.ts';

/**
 * Rate limits per minute by subscription tier.
 * Owner decision #7 — starter: 5, pro: 15, enterprise: 60.
 * Free tier gets 0 (blocked by tier gating before reaching rate limit).
 */
const RATE_LIMITS: Record<string, number> = {
  free: 0,
  starter: 5,
  pro: 15,
  enterprise: 60,
};

/** Look up the per-minute request cap for a subscription tier. */
export function getTierRateLimit(subscriptionTier: string): number {
  const tier = subscriptionTier.toLowerCase();
  return RATE_LIMITS[tier] ?? RATE_LIMITS.starter;
}

/**
 * Check rate limit via the `check_rate_limit` RPC.
 *
 * Returns `null` if the request is allowed (or on infra error — fail open).
 * Returns a 429 `Response` if rate limit is exceeded.
 */
export async function checkRateLimit(
  supabaseAdmin: SupabaseClient,
  userId: string,
  tierLimit: number,
): Promise<Response | null> {
  const { data: rateLimitResult, error: rateLimitError } =
    await supabaseAdmin.rpc('check_rate_limit', {
      p_user_id: userId,
      p_tier_limit: tierLimit,
    });

  if (rateLimitError) {
    // Fail open on infrastructure errors
    console.error('Rate limit check error:', rateLimitError.message);
    return null;
  }

  if (rateLimitResult && !rateLimitResult.allowed) {
    const retryAfterSeconds = rateLimitResult.resets_at
      ? Math.max(
          1,
          Math.ceil(
            (new Date(rateLimitResult.resets_at).getTime() - Date.now()) / 1000,
          ),
        )
      : 60;

    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        code: 'rate_limit_exceeded',
        message: `You have exceeded your rate limit of ${tierLimit} requests per minute. Please wait and try again.`,
        limit: rateLimitResult.limit,
        current_count: rateLimitResult.current_count,
        resets_at: rateLimitResult.resets_at,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers':
            'authorization, x-client-info, apikey, content-type',
          'Retry-After': String(retryAfterSeconds),
        },
      },
    );
  }

  return null;
}

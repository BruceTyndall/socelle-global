/**
 * Credit balance utilities for Supabase Edge Functions.
 *
 * Wraps the `deduct_credits` and `top_up_credits` RPCs with typed
 * interfaces and error classification.
 */

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { jsonResponse } from './cors.ts';

export interface DeductResult {
  balanceAfter: number;
}

/**
 * Deduct credits atomically via the `deduct_credits` RPC.
 *
 * Returns a JSON `Response` (402 or 500) on failure, or the remaining
 * balance on success. Caller pattern:
 *
 * ```ts
 * const result = await deductCredits(supabaseAdmin, { ... });
 * if (result instanceof Response) return result;
 * // result.balanceAfter is the new balance
 * ```
 */
export async function deductCredits(
  supabaseAdmin: SupabaseClient,
  params: {
    userId: string;
    amountUsd: number;
    provider: string;
    model: string;
    tier: number;
    tokensIn?: number;
    tokensOut?: number;
    requestId?: string | null;
    feature: string;
  },
): Promise<DeductResult | Response> {
  const { data: balanceAfter, error: creditError } = await supabaseAdmin.rpc(
    'deduct_credits',
    {
      p_user_id: params.userId,
      p_amount_usd: params.amountUsd,
      p_provider: params.provider,
      p_model: params.model,
      p_tier: params.tier,
      p_tokens_in: params.tokensIn ?? 0,
      p_tokens_out: params.tokensOut ?? 0,
      p_request_id: params.requestId ?? null,
      p_feature: params.feature,
    },
  );

  if (creditError) {
    const isInsufficientFunds = creditError.message
      ?.toLowerCase()
      .includes('insufficient credit');
    if (isInsufficientFunds) {
      return jsonResponse(
        {
          error: 'Insufficient credit balance',
          code: 'insufficient_credits',
          message:
            'Your credit balance is too low for this request. Please top up to continue.',
          upgrade_url: '/pricing',
        },
        402,
      );
    }
    console.error('Credit deduction error:', creditError.message);
    return jsonResponse({ error: 'Billing error — request cancelled' }, 500);
  }

  return {
    balanceAfter: typeof balanceAfter === 'number' ? balanceAfter : 0,
  };
}

/**
 * Reconcile cost difference between estimated and actual usage.
 * Non-blocking — best effort.
 */
export function reconcileCost(
  supabaseAdmin: SupabaseClient,
  userId: string,
  costDelta: number,
  requestId: string,
): void {
  if (Math.abs(costDelta) <= 0.000001) return;

  supabaseAdmin
    .rpc('top_up_credits', {
      p_user_id: userId,
      p_amount_usd: -costDelta,
      p_request_id: requestId,
    })
    .then(({ error }) => {
      if (error) console.warn('Cost reconciliation failed:', error.message);
    });
}

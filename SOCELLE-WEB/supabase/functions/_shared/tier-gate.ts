/**
 * Subscription tier gating for AI edge functions.
 *
 * Enforces which subscription tiers can access which AI tools.
 * Free users get NO AI access. Starter gets basic concierge only.
 * Pro/Enterprise get all 6 AI tools.
 */

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { jsonResponse } from './cors.ts';

/** The 6 AI toolbar tools. */
const ALL_AI_TOOLS = [
  'signal_search',
  'explain_signal',
  'menu_analysis',
  'action_plan',
  'rnd_scout',
  'regional_analysis',
] as const;

/** Concierge-only task types (allowed for Starter). */
const CONCIERGE_TASKS = [
  'chat_concierge',
  'real_time_feedback',
  'messaging_assist',
] as const;

/** Tool → minimum required tier mapping. */
type TierName = 'free' | 'starter' | 'pro' | 'enterprise';

const TIER_RANK: Record<TierName, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

/**
 * Determine the minimum tier required for a given task_type.
 *
 * - Free: no AI access at all
 * - Starter: concierge tasks only (chat_concierge, real_time_feedback, messaging_assist)
 * - Pro+: all tasks including the 6 AI toolbar tools and advanced analysis
 */
function getRequiredTier(taskType: string): TierName {
  if ((CONCIERGE_TASKS as readonly string[]).includes(taskType)) {
    return 'starter';
  }
  // All other tasks (toolbar tools, analysis, etc.) require Pro
  return 'pro';
}

/**
 * Look up the user's subscription tier from user_profiles.
 */
export async function getUserTier(
  supabaseAdmin: SupabaseClient,
  userId: string,
): Promise<string> {
  const { data: profileData } = await supabaseAdmin
    .from('user_profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  return profileData?.subscription_tier ?? 'free';
}

/**
 * Check whether a user's subscription tier allows the requested task.
 *
 * Returns `null` if access is allowed, or a 403 `Response` if denied.
 */
export function enforceTierGate(
  userTier: string,
  taskType: string,
): Response | null {
  const normalizedTier = userTier.toLowerCase() as TierName;
  const requiredTier = getRequiredTier(taskType);

  const userRank = TIER_RANK[normalizedTier] ?? 0;
  const requiredRank = TIER_RANK[requiredTier];

  if (userRank < requiredRank) {
    return jsonResponse(
      {
        error: 'Subscription tier insufficient',
        code: 'tier_insufficient',
        message:
          normalizedTier === 'free'
            ? 'AI tools require an active subscription. Please upgrade to access AI features.'
            : `This AI tool requires a ${requiredTier} subscription or higher. Please upgrade to continue.`,
        current_tier: normalizedTier,
        required_tier: requiredTier,
        upgrade_url: '/pricing',
      },
      403,
    );
  }

  return null;
}

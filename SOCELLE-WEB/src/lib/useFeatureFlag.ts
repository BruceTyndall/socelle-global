/**
 * useFeatureFlag — CTRL-WO-01: Feature Flag System
 *
 * Reads a feature flag from the feature_flags table and evaluates it against
 * the current user context. Check order:
 *   1. User override (enabled_user_ids) — highest priority
 *   2. Tier match (enabled_tiers)
 *   3. Rollout percentage (hash user.id → bucket)
 *   4. Default (default_enabled)
 *
 * Falls back to { enabled: false } on 42P01 (table missing).
 * Uses TanStack Query with 5-minute staleTime.
 *
 * Authority: docs/operations/OPERATION_BREAKOUT.md → CTRL-WO-01
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';
import { useAuth } from './auth';
import { useTier } from '../hooks/useTier';

// ── Types ─────────────────────────────────────────────────────────────────

export interface FeatureFlagRow {
  id: string;
  flag_key: string;
  display_name: string;
  description: string;
  default_enabled: boolean;
  enabled_tiers: string[];
  enabled_user_ids: string[];
  rollout_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface UseFeatureFlagResult {
  enabled: boolean;
  isLoading: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as Record<string, unknown>;
  const code = typeof e.code === 'string' ? e.code : '';
  const message = typeof e.message === 'string' ? e.message.toLowerCase() : '';
  return code === '42P01' || message.includes('does not exist');
}

/**
 * Deterministic hash of a UUID string to a 0-99 bucket.
 * Used for rollout percentage evaluation.
 */
export function hashUserIdToBucket(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0; // force 32-bit int
  }
  return Math.abs(hash) % 100;
}

/**
 * Evaluate a flag row against user context.
 * Exported for testing.
 */
export function evaluateFlag(
  flag: FeatureFlagRow | null,
  userId: string | null,
  tier: string
): boolean {
  if (!flag) return false;

  // 1. User override — highest priority
  if (userId && flag.enabled_user_ids.includes(userId)) {
    return true;
  }

  // 2. Tier match
  if (tier && flag.enabled_tiers.includes(tier)) {
    return true;
  }

  // 3. Rollout percentage (hash user.id → bucket)
  if (userId && flag.rollout_percentage > 0) {
    const bucket = hashUserIdToBucket(userId);
    if (bucket < flag.rollout_percentage) {
      return true;
    }
  }

  // 4. Default
  return flag.default_enabled;
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useFeatureFlag(flagKey: string): UseFeatureFlagResult {
  const { user } = useAuth();
  const { tier } = useTier();
  const userId = user?.id ?? null;

  const { data, isLoading } = useQuery({
    queryKey: ['feature_flag', flagKey],
    queryFn: async (): Promise<FeatureFlagRow | null> => {
      const { data: row, error } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('flag_key', flagKey)
        .maybeSingle();

      // 42P01 fallback: table doesn't exist yet
      if (error && isMissingTableError(error)) {
        return null;
      }
      if (error) {
        // Non-fatal: treat as flag-off
        return null;
      }
      return (row as FeatureFlagRow) ?? null;
    },
    staleTime: 5 * 60_000, // 5 minutes
    gcTime: 10 * 60_000,
  });

  const flag = data ?? null;
  const enabled = evaluateFlag(flag, userId, tier);

  return { enabled, isLoading };
}

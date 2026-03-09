import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

interface CheckFlagArgs {
  supabaseAdmin: SupabaseClient;
  userId: string;
  flagKey: string;
  userTier?: string;
}

/**
 * Server-side feature flag evaluation.
 * Uses public.check_flag(user, key, tier) RPC and fails open on infra errors.
 */
export async function checkFlag({
  supabaseAdmin,
  userId,
  flagKey,
  userTier,
}: CheckFlagArgs): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc('check_flag', {
    p_user_id: userId,
    p_flag_key: flagKey,
    p_user_tier: userTier ?? null,
  });

  if (error) {
    console.error('[checkFlag] RPC error:', error.message);
    return true;
  }

  return typeof data === 'boolean' ? data : true;
}

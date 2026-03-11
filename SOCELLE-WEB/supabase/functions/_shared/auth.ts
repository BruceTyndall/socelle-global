/**
 * Auth utilities for Supabase Edge Functions.
 *
 * Extracts and validates the user from the incoming JWT.
 * Returns a typed result so callers can short-circuit on auth failure.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import type { User } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { jsonResponse } from './cors.ts';

export interface AuthResult {
  user: User;
  authHeader: string;
}

export async function authenticateUser(
  req: Request,
): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  
  // 1. If no header, return a guest user
  if (!authHeader) {
    return {
      user: { id: 'guest', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as User,
      authHeader: '',
    };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  // 2. We have a header, try to verify it
  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabaseUser.auth.getUser();

  // 3. If invalid (expired, mangled), fallback to guest instead of throwing 401
  if (authError || !user) {
    return {
      user: { id: 'guest', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as User,
      authHeader: '',
    };
  }

  // 4. Fully authenticated user
  return { user, authHeader };
}

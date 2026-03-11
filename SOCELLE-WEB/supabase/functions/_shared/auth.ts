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

/**
 * Validate the Authorization header and return the authenticated user.
 *
 * Returns a `Response` (401) if auth fails, or the `AuthResult` on success.
 * Caller should check: `if (result instanceof Response) return result;`
 */
export async function authenticateUser(
  req: Request,
): Promise<AuthResult | Response> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization header' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabaseUser.auth.getUser();

  if (authError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  return { user, authHeader };
}

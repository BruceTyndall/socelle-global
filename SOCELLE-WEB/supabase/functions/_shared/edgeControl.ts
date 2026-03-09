import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const EDGE_CONTROL_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

/**
 * Runtime kill-switch guard for Supabase Edge Functions.
 * Returns:
 * - null when function is enabled (or controls unavailable)
 * - Response(503) when disabled in edge_function_controls
 */
export async function enforceEdgeFunctionEnabled(
  functionName: string,
  req: Request,
): Promise<Response | null> {
  // Always allow CORS preflight requests.
  if (req.method === 'OPTIONS') return null;

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseServiceKey) {
    // Fail open if runtime config is missing.
    return null;
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabaseAdmin
    .from('edge_function_controls')
    .select('is_enabled')
    .eq('function_name', functionName)
    .maybeSingle();

  if (error) {
    // Fail open on infrastructure errors.
    console.error('[edgeControl] lookup error:', error.message);
    return null;
  }

  if (!data) {
    // If the row is missing, default allow.
    return null;
  }

  if (data.is_enabled === false) {
    return new Response(
      JSON.stringify({
        error: 'Edge function disabled',
        code: 'edge_function_disabled',
        function_name: functionName,
      }),
      { status: 503, headers: EDGE_CONTROL_HEADERS },
    );
  }

  return null;
}

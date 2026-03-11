import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

/* ══════════════════════════════════════════════════════════════════
   archive-signals Edge Function (MERCH-INTEL-03-FINAL)
   - Evaluates market_signals older than 30 days.
   - Idea-Mining: "Gold" signals (magnitude >= 15) are gated behind
     Premium Credit spend (requires_credit = true).
   - Standard signals are strictly archived.
   ══════════════════════════════════════════════════════════════════ */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

serve(async (req: Request) => {
  // Option request handling (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thresholdDate = thirtyDaysAgo.toISOString();

    // 1. Fetch eligible aging signals
    const { data: agingSignals, error: fetchErr } = await supabase
      .from('market_signals')
      .select('id, magnitude')
      .lt('created_at', thresholdDate)
      .neq('status', 'archived');

    if (fetchErr) {
      console.error('Fetch error:', fetchErr.message);
      return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500 });
    }

    if (!agingSignals || agingSignals.length === 0) {
      return new Response(JSON.stringify({ message: 'No aging signals to process' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Classify and batch update
    const premiumUpdateIds = agingSignals
      .filter((s) => s.magnitude && s.magnitude >= 15)
      .map((s) => s.id);

    const standardUpdateIds = agingSignals
      .filter((s) => !s.magnitude || s.magnitude < 15)
      .map((s) => s.id);

    const metrics = { premium_gated: premiumUpdateIds.length, standard_archived: standardUpdateIds.length };

    // Update Premium Gates
    if (premiumUpdateIds.length > 0) {
       const { error: premErr } = await supabase
         .from('market_signals')
         .update({ status: 'archived', requires_credit: true })
         .in('id', premiumUpdateIds);
       
       if (premErr) console.error('Premium archive error:', premErr.message);
    }

    // Update Standard Archive
    if (standardUpdateIds.length > 0) {
       const { error: stdErr } = await supabase
         .from('market_signals')
         .update({ status: 'archived', requires_credit: false })
         .in('id', standardUpdateIds);

       if (stdErr) console.error('Standard archive error:', stdErr.message);
    }

    return new Response(JSON.stringify({
      message: 'Archive sweep complete',
      metrics
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMsg }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
});

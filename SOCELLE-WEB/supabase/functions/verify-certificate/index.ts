/**
 * verify-certificate — Supabase Edge Function
 *
 * Public endpoint for verifying a certificate by its verification token.
 * No authentication required. Never exposes user_id or PII beyond name.
 *
 * GET /functions/v1/verify-certificate?token=<verification_token>
 *
 * WO-OVERHAUL-13 — eLearning/LMS backend pass
 * Owner: Backend Agent
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('verify-certificate', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(JSON.stringify({ valid: false, error: "token parameter required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query certificate by verification token
    const { data: cert, error: certErr } = await supabase
      .from("certificates")
      .select("id, certificate_number, course_id, user_id, issued_at, expires_at, ce_credits_awarded")
      .eq("verification_token", token)
      .maybeSingle();

    if (certErr || !cert) {
      return new Response(JSON.stringify({ valid: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiration
    const isExpired = cert.expires_at ? new Date(cert.expires_at) < new Date() : false;

    // Get course title
    const { data: course } = await supabase
      .from("courses")
      .select("title")
      .eq("id", cert.course_id)
      .single();

    // Get learner name (no PII beyond name)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("full_name, first_name, last_name")
      .eq("id", cert.user_id)
      .single();

    const learnerName = profile?.full_name
      || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ")
      || "Verified Learner";

    return new Response(
      JSON.stringify({
        valid: !isExpired,
        certificate_number: cert.certificate_number,
        course_title: course?.title || "Course",
        learner_name: learnerName,
        issued_at: cert.issued_at,
        ce_credits: cert.ce_credits_awarded,
        expires_at: cert.expires_at,
        expired: isExpired,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ valid: false, error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

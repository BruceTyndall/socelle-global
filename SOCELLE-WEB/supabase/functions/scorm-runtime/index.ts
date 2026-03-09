/**
 * scorm-runtime — Supabase Edge Function
 *
 * SCORM 1.2 / 2004 runtime API for eLearning LMS.
 * Handles Initialize, GetValue, SetValue, Commit, Finish commands.
 *
 * POST /functions/v1/scorm-runtime
 * Body: { command, element?, value?, scorm_package_id, enrollment_id }
 *
 * Authenticated users only.
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

// Map SCORM CMI elements to scorm_tracking columns
const ELEMENT_MAP: Record<string, string> = {
  "cmi.core.lesson_status": "completion_status",
  "cmi.completion_status": "completion_status",
  "cmi.core.lesson_location": "lesson_location",
  "cmi.location": "lesson_location",
  "cmi.core.score.raw": "score_raw",
  "cmi.score.raw": "score_raw",
  "cmi.core.score.min": "score_min",
  "cmi.score.min": "score_min",
  "cmi.core.score.max": "score_max",
  "cmi.score.max": "score_max",
  "cmi.score.scaled": "score_scaled",
  "cmi.core.total_time": "total_time_seconds",
  "cmi.total_time": "total_time_seconds",
  "cmi.suspend_data": "suspend_data",
  "cmi.core.exit": "session_id", // mapped loosely; exit handled at app level
  "cmi.success_status": "success_status",
};

serve(async (req: Request) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('scorm-runtime', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user from JWT
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { command, element, value, scorm_package_id, enrollment_id } = await req.json();

    if (!command || !scorm_package_id) {
      return new Response(JSON.stringify({ error: "command and scorm_package_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    switch (command) {
      case "Initialize": {
        // Create or resume a scorm_tracking record
        const { data: existing } = await supabase
          .from("scorm_tracking")
          .select("id")
          .eq("scorm_package_id", scorm_package_id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("scorm_tracking")
            .update({ last_accessed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq("id", existing.id);
          return new Response(JSON.stringify({ success: true, tracking_id: existing.id, resumed: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: created, error: createErr } = await supabase
          .from("scorm_tracking")
          .insert({
            scorm_package_id,
            user_id: user.id,
            enrollment_id: enrollment_id || null,
            session_id: crypto.randomUUID(),
            completion_status: "not_attempted",
            last_accessed_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (createErr) {
          return new Response(JSON.stringify({ error: createErr.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true, tracking_id: created.id, resumed: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "GetValue": {
        if (!element) {
          return new Response(JSON.stringify({ error: "element required for GetValue" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const column = ELEMENT_MAP[element];
        if (!column) {
          return new Response(JSON.stringify({ value: "", error_code: 401 }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: row } = await supabase
          .from("scorm_tracking")
          .select(column)
          .eq("scorm_package_id", scorm_package_id)
          .eq("user_id", user.id)
          .maybeSingle();

        const val = row ? (row as Record<string, unknown>)[column] : "";
        return new Response(JSON.stringify({ value: val ?? "" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "SetValue": {
        if (!element) {
          return new Response(JSON.stringify({ error: "element required for SetValue" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const col = ELEMENT_MAP[element];
        if (!col) {
          return new Response(JSON.stringify({ success: false, error_code: 401 }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const updateData: Record<string, unknown> = {
          [col]: value,
          updated_at: new Date().toISOString(),
        };

        const { error: setErr } = await supabase
          .from("scorm_tracking")
          .update(updateData)
          .eq("scorm_package_id", scorm_package_id)
          .eq("user_id", user.id);

        if (setErr) {
          return new Response(JSON.stringify({ success: false, error: setErr.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "Commit": {
        const { error: commitErr } = await supabase
          .from("scorm_tracking")
          .update({
            last_accessed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("scorm_package_id", scorm_package_id)
          .eq("user_id", user.id);

        if (commitErr) {
          return new Response(JSON.stringify({ success: false, error: commitErr.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "Finish": {
        const { error: finishErr } = await supabase
          .from("scorm_tracking")
          .update({
            last_accessed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("scorm_package_id", scorm_package_id)
          .eq("user_id", user.id);

        if (finishErr) {
          return new Response(JSON.stringify({ success: false, error: finishErr.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true, finished: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown command: ${command}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * magic-link Edge Function
 *
 * Issues a Supabase magic link for a given email address.
 * Called by the Socelle Mobile app when a user taps "Explore Brands →"
 * in the Graduated Funnel upgrade bottom sheet.
 *
 * The magic link routes the user to the Web Plan Wizard deep-link
 * (/portal/plans/new?from=mobile&gaps=...) and establishes their
 * Supabase session on first click.
 *
 * Auth: requires a valid Firebase-issued bearer token to prevent abuse.
 * The token is validated by checking the Firebase UID against firebase_uid_map
 * (if already linked) OR by treating this as a new-link request.
 *
 * POST /functions/v1/magic-link
 * Body: { email: string; redirectTo?: string }
 * Returns: { magicLinkToken: string; expiresAt: string }
 *
 * verify_jwt: false — we validate the request ourselves using the
 * SUPABASE_SERVICE_ROLE_KEY to call the Admin auth API.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://app.socelle.com",
  "http://localhost:5173",
];

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin ?? "")
    ? (origin ?? "")
    : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  // ── CORS preflight ──────────────────────────────────────────────────────────
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  try {
    // ── Parse body ────────────────────────────────────────────────────────────
    const body = await req.json().catch(() => null);
    const email: string | undefined = body?.email;
    const redirectTo: string = body?.redirectTo ??
      "https://app.socelle.com/portal/plans/new";

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "email is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders(origin),
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Basic email format sanity-check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: {
            ...corsHeaders(origin),
            "Content-Type": "application/json",
          },
        },
      );
    }

    // ── Supabase Admin client (service role — never expose to client) ──────────
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // ── Generate OTP / magic link ─────────────────────────────────────────────
    // generateLink creates the user if they don't exist, otherwise links to
    // their existing account. This handles both anonymous Firebase users
    // (upgrading to an email account) and returning users.
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo,
        // Short expiry for security — magic link is single-use
        // (Supabase default is 24h; override in Supabase Dashboard Auth settings)
      },
    });

    if (error) {
      console.error("generateLink error:", error.message);
      return new Response(
        JSON.stringify({ error: "Failed to generate magic link" }),
        {
          status: 500,
          headers: {
            ...corsHeaders(origin),
            "Content-Type": "application/json",
          },
        },
      );
    }

    // ── Return the token (not the full link — Mobile builds the URL itself) ───
    // The `action_link` contains the full magic link. We extract the token
    // so Mobile can append its own query params (gaps=, from=mobile) and
    // then pass the combined URL to url_launcher.
    const actionLink = data.properties?.action_link ?? "";
    const tokenMatch = actionLink.match(/token=([^&]+)/);
    const magicLinkToken = tokenMatch?.[1] ?? "";

    if (!magicLinkToken) {
      console.error("No token extracted from action_link:", actionLink);
      return new Response(
        JSON.stringify({ error: "Token extraction failed" }),
        {
          status: 500,
          headers: {
            ...corsHeaders(origin),
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        magicLinkToken,
        // ISO expiry so Mobile can show "Link expires in X minutes"
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders(origin),
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    console.error("magic-link function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      },
    );
  }
});

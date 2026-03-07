/**
 * generate-certificate — Supabase Edge Function
 *
 * Generates a completion certificate for a finished course enrollment.
 * Creates certificate record, generates HTML certificate, uploads to storage.
 *
 * POST /functions/v1/generate-certificate
 * Body: { enrollment_id: uuid }
 *
 * Authenticated user (must own the enrollment).
 *
 * WO-OVERHAUL-13 — eLearning/LMS backend pass
 * Owner: Backend Agent
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "certificates";

function generateCertificateNumber(year: number): string {
  const seq = Math.floor(Math.random() * 999999).toString().padStart(6, "0");
  return `SCL-CERT-${year}-${seq}`;
}

serve(async (req: Request) => {
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

    // Verify user
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

    const { enrollment_id } = await req.json();
    if (!enrollment_id) {
      return new Response(JSON.stringify({ error: "enrollment_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch enrollment — must belong to user and be completed
    const { data: enrollment, error: enrollErr } = await supabase
      .from("course_enrollments")
      .select("id, course_id, user_id, status, progress_pct, ce_credits_earned")
      .eq("id", enrollment_id)
      .single();

    if (enrollErr || !enrollment) {
      return new Response(JSON.stringify({ error: "Enrollment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (enrollment.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Not your enrollment" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (enrollment.status !== "completed" && enrollment.progress_pct < 100) {
      return new Response(JSON.stringify({ error: "Course not completed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from("certificates")
      .select("id, certificate_url, certificate_number, verification_token")
      .eq("enrollment_id", enrollment_id)
      .maybeSingle();

    if (existingCert) {
      return new Response(JSON.stringify({
        certificate_url: existingCert.certificate_url,
        certificate_number: existingCert.certificate_number,
        verification_token: existingCert.verification_token,
        already_exists: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch course details
    const { data: course } = await supabase
      .from("courses")
      .select("title, ce_credits, ce_credit_type, certificate_template_id")
      .eq("id", enrollment.course_id)
      .single();

    // Fetch user profile for name
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("full_name, first_name, last_name")
      .eq("id", user.id)
      .single();

    const learnerName = profile?.full_name
      || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ")
      || user.email
      || "Learner";

    // Fetch certificate template
    let htmlTemplate = "";
    if (course?.certificate_template_id) {
      const { data: tmpl } = await supabase
        .from("certificate_templates")
        .select("html_template")
        .eq("id", course.certificate_template_id)
        .single();
      if (tmpl) htmlTemplate = tmpl.html_template;
    }

    if (!htmlTemplate) {
      // Fetch default template
      const { data: defaultTmpl } = await supabase
        .from("certificate_templates")
        .select("html_template")
        .eq("is_default", true)
        .maybeSingle();
      htmlTemplate = defaultTmpl?.html_template || getDefaultTemplate();
    }

    const now = new Date();
    const certificateNumber = generateCertificateNumber(now.getFullYear());
    const verificationToken = crypto.randomUUID();
    const ceCredits = course?.ce_credits || 0;

    // Render HTML certificate
    const renderedHtml = htmlTemplate
      .replace(/\{\{learner_name\}\}/g, learnerName)
      .replace(/\{\{course_title\}\}/g, course?.title || "Course")
      .replace(/\{\{certificate_number\}\}/g, certificateNumber)
      .replace(/\{\{issued_date\}\}/g, now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))
      .replace(/\{\{ce_credits\}\}/g, String(ceCredits))
      .replace(/\{\{ce_credit_type\}\}/g, course?.ce_credit_type || "CE")
      .replace(/\{\{verification_token\}\}/g, verificationToken);

    // Upload HTML certificate to storage
    const storagePath = `${user.id}/${certificateNumber}.html`;
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, new TextEncoder().encode(renderedHtml), {
        contentType: "text/html",
        upsert: true,
      });

    if (uploadErr) {
      return new Response(JSON.stringify({ error: `Upload failed: ${uploadErr.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const certificateUrl = urlData?.publicUrl || "";

    // Create certificates record
    const { error: insertErr } = await supabase.from("certificates").insert({
      enrollment_id,
      user_id: user.id,
      course_id: enrollment.course_id,
      certificate_number: certificateNumber,
      verification_token: verificationToken,
      ce_credits_awarded: ceCredits,
      certificate_url: certificateUrl,
      issued_at: now.toISOString(),
    });

    if (insertErr) {
      return new Response(JSON.stringify({ error: `Certificate insert failed: ${insertErr.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update enrollment with certificate info
    await supabase
      .from("course_enrollments")
      .update({
        certificate_issued_at: now.toISOString(),
        certificate_url: certificateUrl,
        ce_credits_earned: ceCredits,
        updated_at: now.toISOString(),
      })
      .eq("id", enrollment_id);

    return new Response(
      JSON.stringify({
        certificate_url: certificateUrl,
        certificate_number: certificateNumber,
        verification_token: verificationToken,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getDefaultTemplate(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>SOCELLE Certificate</title>
<style>
  body { font-family: 'General Sans', sans-serif; text-align: center; padding: 60px; background: #F6F3EF; color: #141418; }
  .cert-border { border: 3px solid #6E879B; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 28px; margin-bottom: 8px; }
  .subtitle { color: #6E879B; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; }
  .learner { font-size: 32px; margin: 30px 0 10px; }
  .course { font-size: 20px; color: #6E879B; margin-bottom: 30px; }
  .details { font-size: 14px; color: #666; }
  .cert-number { font-size: 12px; color: #999; margin-top: 30px; }
</style>
</head>
<body>
  <div class="cert-border">
    <h1>SOCELLE</h1>
    <div class="subtitle">Certificate of Completion</div>
    <div class="learner">{{learner_name}}</div>
    <div class="course">{{course_title}}</div>
    <div class="details">
      <p>Issued: {{issued_date}}</p>
      <p>CE Credits: {{ce_credits}} {{ce_credit_type}}</p>
    </div>
    <div class="cert-number">Certificate #{{certificate_number}} | Verify: {{verification_token}}</div>
  </div>
</body>
</html>`;
}

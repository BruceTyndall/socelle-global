/**
 * process-scorm-upload — Supabase Edge Function
 *
 * Accepts a SCORM ZIP package upload, stores it in Supabase Storage,
 * parses imsmanifest.xml, and updates the scorm_packages record.
 *
 * POST /functions/v1/process-scorm-upload
 * Content-Type: multipart/form-data
 * Fields: file (ZIP), scorm_package_id (uuid)
 *
 * Admin only.
 *
 * WO-OVERHAUL-13 — eLearning/LMS backend pass
 * Owner: Backend Agent
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { BlobReader, ZipReader, TextWriter } from "https://deno.land/x/zipjs@v2.7.32/index.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "scorm-packages";

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

    // Verify admin
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

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const scormPackageId = formData.get("scorm_package_id") as string | null;

    if (!file || !scormPackageId) {
      return new Response(JSON.stringify({ error: "file and scorm_package_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as processing
    await supabase
      .from("scorm_packages")
      .update({ upload_status: "processing", updated_at: new Date().toISOString() })
      .eq("id", scormPackageId);

    // Upload ZIP to storage
    const fileBytes = await file.arrayBuffer();
    const storagePath = `${scormPackageId}/${file.name}`;

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBytes, {
        contentType: "application/zip",
        upsert: true,
      });

    if (uploadErr) {
      await supabase
        .from("scorm_packages")
        .update({ upload_status: "failed", updated_at: new Date().toISOString() })
        .eq("id", scormPackageId);
      return new Response(JSON.stringify({ error: `Upload failed: ${uploadErr.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse imsmanifest.xml from ZIP
    let manifestContent = "";
    let launchUrl = "";
    let scormVersion = "1.2";
    let title = "";

    try {
      const blob = new Blob([fileBytes]);
      const reader = new ZipReader(new BlobReader(blob));
      const entries = await reader.getEntries();

      for (const entry of entries) {
        if (entry.filename.toLowerCase().endsWith("imsmanifest.xml") && entry.getData) {
          const writer = new TextWriter();
          manifestContent = await entry.getData(writer);
          break;
        }
      }
      await reader.close();

      if (manifestContent) {
        // Parse launch URL from manifest — look for resource href
        const hrefMatch = manifestContent.match(/href\s*=\s*"([^"]+)"/);
        if (hrefMatch) {
          launchUrl = hrefMatch[1];
        }

        // Parse title
        const titleMatch = manifestContent.match(/<title>\s*<langstring[^>]*>([^<]+)<\/langstring>/i)
          || manifestContent.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
          title = titleMatch[1].trim();
        }

        // Detect SCORM version
        if (manifestContent.includes("adlcp:scormType") || manifestContent.includes("adlcp_v3")) {
          scormVersion = "2004";
        } else {
          scormVersion = "1.2";
        }
      }
    } catch (parseErr) {
      console.error("Manifest parse error:", parseErr);
      // Continue with defaults — package is still uploaded
    }

    // Build manifest and launch URLs
    const { data: manifestUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);
    const manifestUrl = manifestUrlData?.publicUrl || "";

    // Update scorm_packages record
    const { error: updateErr } = await supabase
      .from("scorm_packages")
      .update({
        manifest_url: manifestUrl,
        launch_url: launchUrl,
        version: scormVersion,
        package_name: title || file.name,
        file_size_bytes: fileBytes.byteLength,
        upload_status: "ready",
        updated_at: new Date().toISOString(),
      })
      .eq("id", scormPackageId);

    if (updateErr) {
      return new Response(JSON.stringify({ error: `Update failed: ${updateErr.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        scorm_package_id: scormPackageId,
        title: title || file.name,
        version: scormVersion,
        launch_url: launchUrl,
        file_size_bytes: fileBytes.byteLength,
        upload_status: "ready",
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

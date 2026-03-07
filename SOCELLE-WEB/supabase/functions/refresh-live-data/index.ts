import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: feeds, error: fetchErr } = await supabase
      .from("live_data_feeds")
      .select("*")
      .eq("is_active", true);

    if (fetchErr) throw fetchErr;

    const results: { id: string; name: string; status: string; error?: string }[] = [];
    let refreshed = 0;
    let errors = 0;

    for (const feed of feeds || []) {
      try {
        if (feed.source_type === "api" && feed.source_url) {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (feed.api_key_ref) {
            headers["Authorization"] = `Bearer ${feed.api_key_ref}`;
          }

          const response = await fetch(feed.source_url, { headers });
          const data = await response.json();

          await supabase
            .from("live_data_feeds")
            .update({
              data_snapshot: data,
              last_refreshed_at: new Date().toISOString(),
              last_status: "success",
              last_error: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", feed.id);

          refreshed++;
          results.push({ id: feed.id, name: feed.name, status: "success" });
        }
      } catch (err) {
        errors++;
        await supabase
          .from("live_data_feeds")
          .update({
            last_status: "error",
            last_error: (err as Error).message,
            updated_at: new Date().toISOString(),
          })
          .eq("id", feed.id);
        results.push({ id: feed.id, name: feed.name, status: "error", error: (err as Error).message });
      }
    }

    return new Response(
      JSON.stringify({ refreshed, errors, details: results }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

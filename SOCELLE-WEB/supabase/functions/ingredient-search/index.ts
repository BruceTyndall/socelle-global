// WO-OVERHAUL-12: Ingredient search edge function
// Public access — no auth required.
// Accepts: ?q=<term>&limit=20&skin_type=<type>&vegan=true&max_ewg=<n>
// Full text search on inci_name, common_name + alias lookup via ingredient_aliases.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req: Request) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('ingredient-search', req);
  if (edgeControlResponse) return edgeControlResponse;
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 100);
    const skinType = url.searchParams.get("skin_type");
    const vegan = url.searchParams.get("vegan");
    const maxEwg = url.searchParams.get("max_ewg");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!q.trim()) {
      // No search term — return recent/popular ingredients with filters
      let query = supabase
        .from("ingredients")
        .select("id, inci_name, common_name, ewg_score, comedogenic_rating, skin_types, benefits, concerns, is_vegan, is_cruelty_free, is_natural, is_fragrance, is_allergen, safety_score, trending_score, function, eu_status")
        .order("trending_score", { ascending: false, nullsFirst: false })
        .limit(limit);

      if (skinType) {
        query = query.contains("skin_types", [skinType]);
      }
      if (vegan === "true") {
        query = query.eq("is_vegan", true);
      }
      if (maxEwg) {
        query = query.lte("ewg_score", parseInt(maxEwg, 10));
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ results: data, count: data?.length || 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Search term provided — search ingredients + aliases
    const searchTerm = q.trim().toLowerCase();
    const ilikePattern = `%${searchTerm}%`;

    // 1) Direct match on ingredients table
    let ingredientQuery = supabase
      .from("ingredients")
      .select("id, inci_name, common_name, ewg_score, comedogenic_rating, skin_types, benefits, concerns, is_vegan, is_cruelty_free, is_natural, is_fragrance, is_allergen, safety_score, trending_score, function, eu_status")
      .or(`inci_name.ilike.${ilikePattern},common_name.ilike.${ilikePattern}`)
      .limit(limit);

    if (skinType) {
      ingredientQuery = ingredientQuery.contains("skin_types", [skinType]);
    }
    if (vegan === "true") {
      ingredientQuery = ingredientQuery.eq("is_vegan", true);
    }
    if (maxEwg) {
      ingredientQuery = ingredientQuery.lte("ewg_score", parseInt(maxEwg, 10));
    }

    const { data: directMatches, error: directError } = await ingredientQuery;
    if (directError) throw directError;

    const directIds = new Set((directMatches || []).map((i: { id: string }) => i.id));

    // 2) Alias match — find ingredient IDs not already in direct matches
    const { data: aliasMatches, error: aliasError } = await supabase
      .from("ingredient_aliases")
      .select("ingredient_id")
      .ilike("alias", ilikePattern)
      .limit(limit);

    if (aliasError) throw aliasError;

    const aliasIds = (aliasMatches || [])
      .map((a: { ingredient_id: string }) => a.ingredient_id)
      .filter((id: string) => !directIds.has(id));

    let aliasIngredients: typeof directMatches = [];
    if (aliasIds.length > 0) {
      let aliasQuery = supabase
        .from("ingredients")
        .select("id, inci_name, common_name, ewg_score, comedogenic_rating, skin_types, benefits, concerns, is_vegan, is_cruelty_free, is_natural, is_fragrance, is_allergen, safety_score, trending_score, function, eu_status")
        .in("id", aliasIds)
        .limit(limit - (directMatches?.length || 0));

      if (skinType) {
        aliasQuery = aliasQuery.contains("skin_types", [skinType]);
      }
      if (vegan === "true") {
        aliasQuery = aliasQuery.eq("is_vegan", true);
      }
      if (maxEwg) {
        aliasQuery = aliasQuery.lte("ewg_score", parseInt(maxEwg, 10));
      }

      const { data: aliasData, error: aliasDataError } = await aliasQuery;
      if (aliasDataError) throw aliasDataError;
      aliasIngredients = aliasData || [];
    }

    const results = [...(directMatches || []), ...aliasIngredients].slice(0, limit);

    return new Response(
      JSON.stringify({ results, count: results.length, query: q }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useIngredientDetail — WO-OVERHAUL-12: Single ingredient profile ─────────
// Fetches one ingredient by slug (lowercased INCI name with spaces→hyphens).
// Includes aliases and interactions.

export interface IngredientDetail {
  id: string;
  inci_name: string;
  common_name: string | null;
  cas_number: string | null;
  cosing_id: string | null;
  function: string[];
  eu_status: 'allowed' | 'restricted' | 'banned' | null;
  ewg_score: number | null;
  ewg_score_source: string | null;
  comedogenic_rating: number | null;
  skin_types: string[];
  benefits: string[];
  concerns: string[];
  is_vegan: boolean | null;
  is_cruelty_free: boolean | null;
  is_natural: boolean | null;
  is_fragrance: boolean | null;
  is_allergen: boolean | null;
  restricted_regions: string[];
  safety_score: number | null;
  trending_score: number | null;
  description: string | null;
  updated_at: string;
}

export interface IngredientAlias {
  id: string;
  alias: string;
  alias_type: string | null;
}

export interface IngredientInteraction {
  id: string;
  ingredient_id_a: string;
  ingredient_id_b: string;
  interaction_type: 'synergistic' | 'avoid' | 'caution' | 'neutral';
  explanation: string | null;
  source: string | null;
  partner_name: string;
}

export interface UseIngredientDetailReturn {
  ingredient: IngredientDetail | null;
  aliases: IngredientAlias[];
  interactions: IngredientInteraction[];
  loading: boolean;
  isLive: boolean;
  notFound: boolean;
}

export function slugToInci(slug: string): string {
  return slug.replace(/-/g, ' ');
}

export function inciToSlug(inci: string): string {
  return inci.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function useIngredientDetail(slug: string): UseIngredientDetailReturn {
  const [ingredient, setIngredient] = useState<IngredientDetail | null>(null);
  const [aliases, setAliases] = useState<IngredientAlias[]>([]);
  const [interactions, setInteractions] = useState<IngredientInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setNotFound(false);

      if (!isSupabaseConfigured || !slug) {
        setIngredient(null);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        // Find ingredient by slug match (case-insensitive INCI name)
        const searchName = slugToInci(slug);
        const { data, error } = await supabase
          .from('ingredients')
          .select('id, inci_name, common_name, cas_number, cosing_id, function, eu_status, ewg_score, ewg_score_source, comedogenic_rating, skin_types, benefits, concerns, is_vegan, is_cruelty_free, is_natural, is_fragrance, is_allergen, restricted_regions, safety_score, trending_score, description, updated_at')
          .ilike('inci_name', searchName)
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        if (error || !data) {
          setIngredient(null);
          setIsLive(false);
          setNotFound(true);
          setLoading(false);
          return;
        }

        const ing: IngredientDetail = {
          ...data,
          function: data.function ?? [],
          skin_types: data.skin_types ?? [],
          benefits: data.benefits ?? [],
          concerns: data.concerns ?? [],
          restricted_regions: data.restricted_regions ?? [],
          eu_status: (data.eu_status as IngredientDetail['eu_status']) ?? null,
        };
        setIngredient(ing);
        setIsLive(true);

        // Fetch aliases
        const { data: aliasData } = await supabase
          .from('ingredient_aliases')
          .select('id, alias, alias_type')
          .eq('ingredient_id', data.id)
          .order('alias');

        if (!cancelled) {
          setAliases((aliasData ?? []) as IngredientAlias[]);
        }

        // Fetch interactions (both sides)
        const { data: interA } = await supabase
          .from('ingredient_interactions')
          .select('id, ingredient_id_a, ingredient_id_b, interaction_type, explanation, source')
          .eq('ingredient_id_a', data.id);

        const { data: interB } = await supabase
          .from('ingredient_interactions')
          .select('id, ingredient_id_a, ingredient_id_b, interaction_type, explanation, source')
          .eq('ingredient_id_b', data.id);

        if (cancelled) return;

        const allInteractions = [...(interA ?? []), ...(interB ?? [])];
        // Resolve partner names
        const partnerIds = allInteractions.map((i) =>
          i.ingredient_id_a === data.id ? i.ingredient_id_b : i.ingredient_id_a
        );

        let partnerMap: Record<string, string> = {};
        if (partnerIds.length > 0) {
          const { data: partners } = await supabase
            .from('ingredients')
            .select('id, inci_name')
            .in('id', partnerIds);
          if (partners) {
            partnerMap = Object.fromEntries(partners.map((p) => [p.id, p.inci_name]));
          }
        }

        if (!cancelled) {
          setInteractions(
            allInteractions.map((i) => ({
              ...i,
              interaction_type: i.interaction_type as IngredientInteraction['interaction_type'],
              partner_name:
                partnerMap[
                  i.ingredient_id_a === data.id ? i.ingredient_id_b : i.ingredient_id_a
                ] ?? 'Unknown',
            }))
          );
        }
      } catch {
        if (!cancelled) {
          setIngredient(null);
          setIsLive(false);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [slug]);

  return { ingredient, aliases, interactions, loading, isLive, notFound };
}

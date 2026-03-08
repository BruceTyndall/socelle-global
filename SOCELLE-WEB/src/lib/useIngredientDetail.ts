import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useIngredientDetail — WO-OVERHAUL-12: Single ingredient profile ─────────
// Fetches one ingredient by slug (lowercased INCI name with spaces->hyphens).
// Includes aliases and interactions.
// Migrated to TanStack Query v5 (V2-TECH-04).

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

interface DetailResult {
  ingredient: IngredientDetail;
  aliases: IngredientAlias[];
  interactions: IngredientInteraction[];
}

export function useIngredientDetail(slug: string): UseIngredientDetailReturn {
  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['ingredient_detail', slug],
    queryFn: async (): Promise<DetailResult> => {
      const searchName = slugToInci(slug);
      const { data: ingData, error } = await supabase
        .from('ingredients')
        .select('id, inci_name, common_name, cas_number, cosing_id, function, eu_status, ewg_score, ewg_score_source, comedogenic_rating, skin_types, benefits, concerns, is_vegan, is_cruelty_free, is_natural, is_fragrance, is_allergen, restricted_regions, safety_score, trending_score, description, updated_at')
        .ilike('inci_name', searchName)
        .limit(1)
        .maybeSingle();

      if (error || !ingData) throw new Error(error?.message ?? 'Ingredient not found');

      const ing: IngredientDetail = {
        ...ingData,
        function: ingData.function ?? [],
        skin_types: ingData.skin_types ?? [],
        benefits: ingData.benefits ?? [],
        concerns: ingData.concerns ?? [],
        restricted_regions: ingData.restricted_regions ?? [],
        eu_status: (ingData.eu_status as IngredientDetail['eu_status']) ?? null,
      };

      // Fetch aliases
      const { data: aliasData } = await supabase
        .from('ingredient_aliases')
        .select('id, alias, alias_type')
        .eq('ingredient_id', ingData.id)
        .order('alias');

      // Fetch interactions (both sides)
      const [{ data: interA }, { data: interB }] = await Promise.all([
        supabase.from('ingredient_interactions')
          .select('id, ingredient_id_a, ingredient_id_b, interaction_type, explanation, source')
          .eq('ingredient_id_a', ingData.id),
        supabase.from('ingredient_interactions')
          .select('id, ingredient_id_a, ingredient_id_b, interaction_type, explanation, source')
          .eq('ingredient_id_b', ingData.id),
      ]);

      const allInteractions = [...(interA ?? []), ...(interB ?? [])];
      const partnerIds = allInteractions.map((i) =>
        i.ingredient_id_a === ingData.id ? i.ingredient_id_b : i.ingredient_id_a
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

      return {
        ingredient: ing,
        aliases: (aliasData ?? []) as IngredientAlias[],
        interactions: allInteractions.map((i) => ({
          ...i,
          interaction_type: i.interaction_type as IngredientInteraction['interaction_type'],
          partner_name:
            partnerMap[
              i.ingredient_id_a === ingData.id ? i.ingredient_id_b : i.ingredient_id_a
            ] ?? 'Unknown',
        })),
      };
    },
    enabled: isSupabaseConfigured && !!slug,
  });

  const ingredient = data?.ingredient ?? null;
  const aliases = data?.aliases ?? [];
  const interactions = data?.interactions ?? [];
  const isLive = ingredient !== null;
  const notFound = !loading && ingredient === null && !!queryError;

  return { ingredient, aliases, interactions, loading, isLive, notFound };
}

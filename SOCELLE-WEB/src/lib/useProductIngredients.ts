import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useProductIngredients — WO-OVERHAUL-12 ──────────────────────────────────
// Fetches ingredients for a given product_id via product_ingredients junction.
// Migrated to TanStack Query v5 (V2-TECH-04).

export interface ProductIngredientEntry {
  id: string;
  ingredient_id: string;
  inci_name: string;
  common_name: string | null;
  position: number;
  concentration_pct: number | null;
  function_in_product: string | null;
  ewg_score: number | null;
}

export interface UseProductIngredientsReturn {
  ingredients: ProductIngredientEntry[];
  loading: boolean;
  isLive: boolean;
}

export function useProductIngredients(productId: string | undefined): UseProductIngredientsReturn {
  const { data: ingredients = [], isLoading: loading } = useQuery({
    queryKey: ['product_ingredients', productId],
    queryFn: async () => {
      // Get junction rows
      const { data: junctionData, error: junctionError } = await supabase
        .from('product_ingredients')
        .select('id, ingredient_id, position, concentration_pct, function_in_product')
        .eq('product_id', productId!)
        .order('position');

      if (junctionError || !junctionData || junctionData.length === 0) return [];

      // Get ingredient details
      const ingIds = junctionData.map((j) => j.ingredient_id);
      const { data: ingData } = await supabase
        .from('ingredients')
        .select('id, inci_name, common_name, ewg_score')
        .in('id', ingIds);

      const ingMap = Object.fromEntries(
        (ingData ?? []).map((i) => [i.id, i])
      );

      return junctionData.map((j): ProductIngredientEntry => ({
        id: j.id,
        ingredient_id: j.ingredient_id,
        inci_name: ingMap[j.ingredient_id]?.inci_name ?? 'Unknown',
        common_name: ingMap[j.ingredient_id]?.common_name ?? null,
        position: j.position,
        concentration_pct: j.concentration_pct,
        function_in_product: j.function_in_product,
        ewg_score: ingMap[j.ingredient_id]?.ewg_score ?? null,
      }));
    },
    enabled: isSupabaseConfigured && !!productId,
  });

  const isLive = ingredients.length > 0;

  return { ingredients, loading, isLive };
}

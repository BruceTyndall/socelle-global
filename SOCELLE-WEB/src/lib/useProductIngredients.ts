import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useProductIngredients — WO-OVERHAUL-12 ──────────────────────────────────
// Fetches ingredients for a given product_id via product_ingredients junction.

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
  const [ingredients, setIngredients] = useState<ProductIngredientEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);

      if (!isSupabaseConfigured || !productId) {
        setIngredients([]);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        // Get junction rows
        const { data: junctionData, error: junctionError } = await supabase
          .from('product_ingredients')
          .select('id, ingredient_id, position, concentration_pct, function_in_product')
          .eq('product_id', productId)
          .order('position');

        if (cancelled) return;

        if (junctionError || !junctionData || junctionData.length === 0) {
          setIngredients([]);
          setIsLive(false);
          setLoading(false);
          return;
        }

        // Get ingredient details
        const ingIds = junctionData.map((j) => j.ingredient_id);
        const { data: ingData } = await supabase
          .from('ingredients')
          .select('id, inci_name, common_name, ewg_score')
          .in('id', ingIds);

        if (cancelled) return;

        const ingMap = Object.fromEntries(
          (ingData ?? []).map((i) => [i.id, i])
        );

        setIngredients(
          junctionData.map((j) => ({
            id: j.id,
            ingredient_id: j.ingredient_id,
            inci_name: ingMap[j.ingredient_id]?.inci_name ?? 'Unknown',
            common_name: ingMap[j.ingredient_id]?.common_name ?? null,
            position: j.position,
            concentration_pct: j.concentration_pct,
            function_in_product: j.function_in_product,
            ewg_score: ingMap[j.ingredient_id]?.ewg_score ?? null,
          }))
        );
        setIsLive(true);
      } catch {
        if (!cancelled) {
          setIngredients([]);
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [productId]);

  return { ingredients, loading, isLive };
}

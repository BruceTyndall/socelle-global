import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useIngredientSearch — WO-OVERHAUL-12 ────────────────────────────────────
// Calls the ingredient-search edge function with advanced filters.
// Falls back to direct DB query if edge function is unavailable.
// Migrated to TanStack Query v5 (V2-TECH-04).

export interface SearchIngredient {
  id: string;
  inci_name: string;
  common_name: string | null;
  ewg_score: number | null;
  comedogenic_rating: number | null;
  skin_types: string[];
  benefits: string[];
  concerns: string[];
  is_vegan: boolean | null;
  is_cruelty_free: boolean | null;
  is_natural: boolean | null;
  is_fragrance: boolean | null;
  is_allergen: boolean | null;
  safety_score: number | null;
  trending_score: number | null;
  function: string[];
  eu_status: string | null;
}

export interface SearchFilters {
  q: string;
  limit?: number;
  skin_type?: string;
  vegan?: boolean;
  max_ewg?: number;
}

export interface UseIngredientSearchReturn {
  results: SearchIngredient[];
  count: number;
  loading: boolean;
  isLive: boolean;
}

function normalizeResult(r: SearchIngredient): SearchIngredient {
  return {
    ...r,
    skin_types: r.skin_types ?? [],
    benefits: r.benefits ?? [],
    concerns: r.concerns ?? [],
    function: r.function ?? [],
  };
}

export function useIngredientSearch(filters: SearchFilters): UseIngredientSearchReturn {
  // Debounce search input internally (300ms)
  const [debouncedQ, setDebouncedQ] = useState(filters.q);

  useEffect(() => {
    if (!filters.q) { setDebouncedQ(''); return; }
    const timer = setTimeout(() => setDebouncedQ(filters.q), 300);
    return () => clearTimeout(timer);
  }, [filters.q]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['ingredient_search', { q: debouncedQ, limit: filters.limit, skin_type: filters.skin_type, vegan: filters.vegan, max_ewg: filters.max_ewg }],
    queryFn: async () => {
      // Try edge function first
      const params = new URLSearchParams();
      if (debouncedQ) params.set('q', debouncedQ);
      params.set('limit', String(filters.limit ?? 30));
      if (filters.skin_type) params.set('skin_type', filters.skin_type);
      if (filters.vegan) params.set('vegan', 'true');
      if (filters.max_ewg != null) params.set('max_ewg', String(filters.max_ewg));

      const queryString = params.toString();
      const functionName = queryString ? `ingredient-search?${queryString}` : 'ingredient-search';
      const { data: fnData, error: fnError } = await supabase.functions.invoke(functionName, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!fnError && fnData) {
        const parsed = fnData as { results: SearchIngredient[]; count: number };
        return { results: (parsed.results ?? []).map(normalizeResult), count: parsed.count ?? 0 };
      }

      // Direct DB fallback
      let query = supabase
        .from('ingredients')
        .select('id, inci_name, common_name, ewg_score, comedogenic_rating, skin_types, benefits, concerns, is_vegan, is_cruelty_free, is_natural, is_fragrance, is_allergen, safety_score, trending_score, function, eu_status', { count: 'exact' })
        .order('inci_name')
        .limit(filters.limit ?? 30);

      if (debouncedQ.trim()) {
        query = query.or(`inci_name.ilike.%${debouncedQ.trim()}%,common_name.ilike.%${debouncedQ.trim()}%`);
      }
      if (filters.skin_type) query = query.contains('skin_types', [filters.skin_type]);
      if (filters.vegan) query = query.eq('is_vegan', true);
      if (filters.max_ewg != null) query = query.lte('ewg_score', filters.max_ewg);

      const { data: dbData, error: dbError, count: dbCount } = await query;
      if (dbError || !dbData) return { results: [] as SearchIngredient[], count: 0 };
      return {
        results: (dbData as SearchIngredient[]).map(normalizeResult),
        count: dbCount ?? dbData.length,
      };
    },
    enabled: isSupabaseConfigured,
  });

  const results = data?.results ?? [];
  const count = data?.count ?? 0;
  const isLive = results.length > 0;

  return { results, count, loading, isLive };
}

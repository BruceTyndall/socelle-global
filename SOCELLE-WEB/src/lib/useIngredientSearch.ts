import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useIngredientSearch — WO-OVERHAUL-12 ────────────────────────────────────
// Calls the ingredient-search edge function with advanced filters.
// Falls back to direct DB query if edge function is unavailable.

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

export function useIngredientSearch(filters: SearchFilters): UseIngredientSearchReturn {
  const [results, setResults] = useState<SearchIngredient[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      if (!isSupabaseConfigured) {
        setResults([]);
        setCount(0);
        setIsLive(false);
        return;
      }

      setLoading(true);

      try {
        // Build edge function URL params
        const params = new URLSearchParams();
        if (filters.q) params.set('q', filters.q);
        params.set('limit', String(filters.limit ?? 30));
        if (filters.skin_type) params.set('skin_type', filters.skin_type);
        if (filters.vegan) params.set('vegan', 'true');
        if (filters.max_ewg != null) params.set('max_ewg', String(filters.max_ewg));

        const { data, error } = await supabase.functions.invoke('ingredient-search', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: null,
        });

        // Edge function invoke doesn't support GET params well — fall back to direct query
        if (error || !data) {
          // Direct DB fallback
          let query = supabase
            .from('ingredients')
            .select('id, inci_name, common_name, ewg_score, comedogenic_rating, skin_types, benefits, concerns, is_vegan, is_cruelty_free, is_natural, is_fragrance, is_allergen, safety_score, trending_score, function, eu_status', { count: 'exact' })
            .order('inci_name')
            .limit(filters.limit ?? 30);

          if (filters.q.trim()) {
            query = query.or(
              `inci_name.ilike.%${filters.q.trim()}%,common_name.ilike.%${filters.q.trim()}%`
            );
          }
          if (filters.skin_type) {
            query = query.contains('skin_types', [filters.skin_type]);
          }
          if (filters.vegan) {
            query = query.eq('is_vegan', true);
          }
          if (filters.max_ewg != null) {
            query = query.lte('ewg_score', filters.max_ewg);
          }

          const { data: dbData, error: dbError, count: dbCount } = await query;
          if (cancelled) return;

          if (dbError || !dbData) {
            setResults([]);
            setCount(0);
            setIsLive(false);
          } else {
            setResults(
              (dbData as SearchIngredient[]).map((r) => ({
                ...r,
                skin_types: r.skin_types ?? [],
                benefits: r.benefits ?? [],
                concerns: r.concerns ?? [],
                function: r.function ?? [],
              }))
            );
            setCount(dbCount ?? dbData.length);
            setIsLive(true);
          }
        } else {
          if (cancelled) return;
          const parsed = data as { results: SearchIngredient[]; count: number };
          setResults(
            (parsed.results ?? []).map((r) => ({
              ...r,
              skin_types: r.skin_types ?? [],
              benefits: r.benefits ?? [],
              concerns: r.concerns ?? [],
              function: r.function ?? [],
            }))
          );
          setCount(parsed.count ?? 0);
          setIsLive(true);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setCount(0);
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, filters.q ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filters.q, filters.limit, filters.skin_type, filters.vegan, filters.max_ewg]);

  return { results, count, loading, isLive };
}

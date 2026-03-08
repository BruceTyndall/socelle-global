import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useIngredients — W12-22: Public Ingredient Directory ──────────────────
// Fetches from public.ingredients (INCI registry).
// Empty array if DB is empty — no mock fallback per W12-22 spec.
// Supports debounced search across inci_name and common_name.
// Migrated to TanStack Query v5 (V2-TECH-04).

export interface Ingredient {
  id: string;
  inci_name: string;
  common_name: string | null;
  cas_number: string | null;
  function: string[];
  eu_status: 'allowed' | 'restricted' | 'banned' | null;
  description: string | null;
  updated_at: string;
}

export interface UseIngredientsReturn {
  ingredients: Ingredient[];
  loading: boolean;
  isLive: boolean;
  total: number;
}

interface IngredientRow {
  id: string;
  inci_name: string;
  common_name: string | null;
  cas_number: string | null;
  function: string[];
  eu_status: string | null;
  description: string | null;
  updated_at: string;
}

function rowToIngredient(row: IngredientRow): Ingredient {
  return {
    id: row.id,
    inci_name: row.inci_name,
    common_name: row.common_name,
    cas_number: row.cas_number,
    function: row.function ?? [],
    eu_status: (row.eu_status as Ingredient['eu_status']) ?? null,
    description: row.description,
    updated_at: row.updated_at,
  };
}

export function useIngredients(search = '', limit = 60): UseIngredientsReturn {
  // Debounce search input internally (300ms)
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    if (!search) { setDebouncedSearch(''); return; }
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['ingredients', { search: debouncedSearch, limit }],
    queryFn: async () => {
      let query = supabase
        .from('ingredients')
        .select('id, inci_name, common_name, cas_number, function, eu_status, description, updated_at', { count: 'exact' })
        .order('inci_name', { ascending: true })
        .limit(limit);

      if (debouncedSearch.trim()) {
        query = query.or(
          `inci_name.ilike.%${debouncedSearch.trim()}%,common_name.ilike.%${debouncedSearch.trim()}%`
        );
      }

      const { data, error, count } = await query;
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) return { ingredients: [] as Ingredient[], total: 0 };
      return {
        ingredients: (data as IngredientRow[]).map(rowToIngredient),
        total: count ?? data.length,
      };
    },
    enabled: isSupabaseConfigured,
  });

  const ingredients = data?.ingredients ?? [];
  const total = data?.total ?? 0;
  const isLive = ingredients.length > 0;

  return { ingredients, loading, isLive, total };
}

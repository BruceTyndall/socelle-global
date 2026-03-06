import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useIngredients — W12-22: Public Ingredient Directory ──────────────────
// Fetches from public.ingredients (INCI registry).
// Empty array if DB is empty — no mock fallback per W12-22 spec.
// Supports debounced search across inci_name and common_name.

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
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // Debounce search queries by 300ms
    const timer = setTimeout(async () => {
      setLoading(true);

      if (!isSupabaseConfigured) {
        setIngredients([]);
        setIsLive(false);
        setTotal(0);
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('ingredients')
          .select('id, inci_name, common_name, cas_number, function, eu_status, description, updated_at', { count: 'exact' })
          .order('inci_name', { ascending: true })
          .limit(limit);

        if (search.trim()) {
          query = query.or(
            `inci_name.ilike.%${search.trim()}%,common_name.ilike.%${search.trim()}%`
          );
        }

        const { data, error, count } = await query;

        if (cancelled) return;

        if (error || !data || data.length === 0) {
          setIngredients([]);
          setIsLive(false);
          setTotal(0);
        } else {
          setIngredients((data as IngredientRow[]).map(rowToIngredient));
          setIsLive(true);
          setTotal(count ?? data.length);
        }
      } catch {
        if (!cancelled) {
          setIngredients([]);
          setIsLive(false);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, search ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, limit]);

  return { ingredients, loading, isLive, total };
}

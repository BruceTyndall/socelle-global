import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useIngredientCollections — WO-OVERHAUL-12 ───────────────────────────────
// Fetches ingredient collections (featured, by type, or by slug).
// Migrated to TanStack Query v5 (V2-TECH-04).

export interface IngredientCollection {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  collection_type: string | null;
  is_featured: boolean;
  created_at: string;
  item_count?: number;
}

export interface CollectionIngredient {
  id: string;
  inci_name: string;
  common_name: string | null;
  ewg_score: number | null;
  benefits: string[];
  function: string[];
  sort_order: number;
}

export interface UseIngredientCollectionsReturn {
  collections: IngredientCollection[];
  loading: boolean;
  isLive: boolean;
}

export function useIngredientCollections(opts?: {
  featured?: boolean;
}): UseIngredientCollectionsReturn {
  const { data: collections = [], isLoading: loading } = useQuery({
    queryKey: ['ingredient_collections', opts?.featured],
    queryFn: async () => {
      let query = supabase
        .from('ingredient_collections')
        .select('id, name, description, slug, collection_type, is_featured, created_at')
        .order('name');

      if (opts?.featured) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) return [];

      // Get item counts
      const ids = data.map((c) => c.id);
      const { data: items } = await supabase
        .from('ingredient_collection_items')
        .select('collection_id')
        .in('collection_id', ids);

      const counts: Record<string, number> = {};
      (items ?? []).forEach((item) => {
        counts[item.collection_id] = (counts[item.collection_id] || 0) + 1;
      });

      return data.map((c) => ({ ...c, item_count: counts[c.id] || 0 })) as IngredientCollection[];
    },
    enabled: isSupabaseConfigured,
  });

  const isLive = collections.length > 0;

  return { collections, loading, isLive };
}

// ── Single collection by slug with ingredients ──────────────────────────────

export interface UseCollectionDetailReturn {
  collection: IngredientCollection | null;
  ingredients: CollectionIngredient[];
  loading: boolean;
  isLive: boolean;
  notFound: boolean;
}

interface CollectionDetailResult {
  collection: IngredientCollection;
  ingredients: CollectionIngredient[];
}

export function useCollectionDetail(slug: string): UseCollectionDetailReturn {
  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['ingredient_collection_detail', slug],
    queryFn: async (): Promise<CollectionDetailResult> => {
      const { data: colData, error } = await supabase
        .from('ingredient_collections')
        .select('id, name, description, slug, collection_type, is_featured, created_at')
        .eq('slug', slug)
        .maybeSingle();

      if (error || !colData) throw new Error(error?.message ?? 'Collection not found');

      // Fetch collection items with ingredient data
      const { data: items } = await supabase
        .from('ingredient_collection_items')
        .select('sort_order, ingredient_id')
        .eq('collection_id', colData.id)
        .order('sort_order');

      let ingredients: CollectionIngredient[] = [];
      if (items && items.length > 0) {
        const ingIds = items.map((i) => i.ingredient_id);
        const { data: ings } = await supabase
          .from('ingredients')
          .select('id, inci_name, common_name, ewg_score, benefits, function')
          .in('id', ingIds);

        if (ings) {
          const sortMap = Object.fromEntries(
            items.map((i) => [i.ingredient_id, i.sort_order])
          );
          ingredients = ings
            .map((ing) => ({
              ...ing,
              benefits: ing.benefits ?? [],
              function: ing.function ?? [],
              sort_order: sortMap[ing.id] ?? 0,
            }))
            .sort((a, b) => a.sort_order - b.sort_order);
        }
      }

      return { collection: colData as IngredientCollection, ingredients };
    },
    enabled: isSupabaseConfigured && !!slug,
  });

  const collection = data?.collection ?? null;
  const ingredients = data?.ingredients ?? [];
  const isLive = collection !== null;
  const notFound = !loading && collection === null && !!queryError;

  return { collection, ingredients, loading, isLive, notFound };
}

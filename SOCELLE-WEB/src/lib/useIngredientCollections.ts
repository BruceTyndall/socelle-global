import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useIngredientCollections — WO-OVERHAUL-12 ───────────────────────────────
// Fetches ingredient collections (featured, by type, or by slug).

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
  const [collections, setCollections] = useState<IngredientCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      if (!isSupabaseConfigured) {
        setCollections([]);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('ingredient_collections')
          .select('id, name, description, slug, collection_type, is_featured, created_at')
          .order('name');

        if (opts?.featured) {
          query = query.eq('is_featured', true);
        }

        const { data, error } = await query;
        if (cancelled) return;

        if (error || !data || data.length === 0) {
          setCollections([]);
          setIsLive(false);
        } else {
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

          if (!cancelled) {
            setCollections(
              data.map((c) => ({ ...c, item_count: counts[c.id] || 0 }))
            );
            setIsLive(true);
          }
        }
      } catch {
        if (!cancelled) {
          setCollections([]);
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [opts?.featured]);

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

export function useCollectionDetail(slug: string): UseCollectionDetailReturn {
  const [collection, setCollection] = useState<IngredientCollection | null>(null);
  const [ingredients, setIngredients] = useState<CollectionIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setNotFound(false);

      if (!isSupabaseConfigured || !slug) {
        setCollection(null);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('ingredient_collections')
          .select('id, name, description, slug, collection_type, is_featured, created_at')
          .eq('slug', slug)
          .maybeSingle();

        if (cancelled) return;

        if (error || !data) {
          setCollection(null);
          setNotFound(true);
          setIsLive(false);
          setLoading(false);
          return;
        }

        setCollection(data);
        setIsLive(true);

        // Fetch collection items with ingredient data
        const { data: items } = await supabase
          .from('ingredient_collection_items')
          .select('sort_order, ingredient_id')
          .eq('collection_id', data.id)
          .order('sort_order');

        if (cancelled) return;

        if (items && items.length > 0) {
          const ingIds = items.map((i) => i.ingredient_id);
          const { data: ings } = await supabase
            .from('ingredients')
            .select('id, inci_name, common_name, ewg_score, benefits, function')
            .in('id', ingIds);

          if (!cancelled && ings) {
            const sortMap = Object.fromEntries(
              items.map((i) => [i.ingredient_id, i.sort_order])
            );
            setIngredients(
              ings
                .map((ing) => ({
                  ...ing,
                  benefits: ing.benefits ?? [],
                  function: ing.function ?? [],
                  sort_order: sortMap[ing.id] ?? 0,
                }))
                .sort((a, b) => a.sort_order - b.sort_order)
            );
          }
        } else {
          if (!cancelled) setIngredients([]);
        }
      } catch {
        if (!cancelled) {
          setCollection(null);
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

  return { collection, ingredients, loading, isLive, notFound };
}

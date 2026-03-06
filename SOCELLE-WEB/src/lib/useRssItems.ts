import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useRssItems — W12-21: Live RSS news feed for Insights page ────────────
// Fetches from rss_items joined with rss_sources.
// Returns empty array (not mock data) if DB is empty — per W12-21 spec.
// isLive=true only when Supabase returned at least one row.

export interface RssItem {
  id: string;
  title: string;
  description: string;
  link: string | null;
  published_at: string | null;
  attribution_text: string;
  category: string;
  source_name: string;
}

export interface UseRssItemsReturn {
  items: RssItem[];
  loading: boolean;
  isLive: boolean;
}

// Internal DB row shape (rss_items + rss_sources join)
interface RssItemRow {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  published_at: string | null;
  attribution_text: string;
  vertical_tags: string[];
  rss_sources: {
    name: string;
    category: string;
  } | null;
}

function rowToItem(row: RssItemRow): RssItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    link: row.link,
    published_at: row.published_at,
    attribution_text: row.attribution_text,
    // Prefer first vertical_tag; fall back to rss_sources.category
    category: row.vertical_tags?.[0] ?? row.rss_sources?.category ?? 'Beauty',
    source_name: row.rss_sources?.name ?? '',
  };
}

export function useRssItems(limit = 12): UseRssItemsReturn {
  const [items, setItems] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      setLoading(true);

      if (!isSupabaseConfigured) {
        // No Supabase config — empty state, no mock fallback (W12-21)
        setItems([]);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('rss_items')
          .select(
            'id, title, description, link, published_at, attribution_text, vertical_tags, rss_sources ( name, category )'
          )
          .order('published_at', { ascending: false })
          .limit(limit);

        if (cancelled) return;

        if (error || !data || data.length === 0) {
          setItems([]);
          setIsLive(false);
        } else {
          setItems((data as RssItemRow[]).map(rowToItem));
          setIsLive(true);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchItems();
    return () => { cancelled = true; };
  }, [limit]);

  return { items, loading, isLive };
}

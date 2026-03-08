import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useRssItems — W12-21: Live RSS news feed for Insights page ────────────
// Fetches from rss_items joined with rss_sources.
// Returns empty array (not mock data) if DB is empty — per W12-21 spec.
// isLive=true only when Supabase returned at least one row.
// Migrated to TanStack Query v5 (V2-TECH-04).

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
  }[] | null;
}

function rowToItem(row: RssItemRow): RssItem {
  const source = row.rss_sources?.[0] ?? null;
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    link: row.link,
    published_at: row.published_at,
    attribution_text: row.attribution_text,
    // Prefer first vertical_tag; fall back to rss_sources.category
    category: row.vertical_tags?.[0] ?? source?.category ?? 'Beauty',
    source_name: source?.name ?? '',
  };
}

export function useRssItems(limit = 12): UseRssItemsReturn {
  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: ['rss_items', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rss_items')
        .select(
          'id, title, description, link, published_at, attribution_text, vertical_tags, rss_sources ( name, category )'
        )
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);
      if (!data || data.length === 0) return [];
      return (data as RssItemRow[]).map(rowToItem);
    },
    enabled: isSupabaseConfigured,
  });

  const isLive = items.length > 0;

  return { items, loading, isLive };
}

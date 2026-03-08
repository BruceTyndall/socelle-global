import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useSitemapEntries — WO-OVERHAUL-03: Sitemap entries data hook ─────
// Fetches all entries from sitemap_entries table.
// Falls back gracefully when Supabase is unavailable.
// Migrated to TanStack Query v5 (V2-TECH-04).

export interface SitemapEntry {
  id: string;
  loc: string;
  changefreq: string | null;
  priority: number | null;
  lastmod: string | null;
  created_at: string;
  updated_at: string;
}

interface UseSitemapEntriesReturn {
  entries: SitemapEntry[];
  loading: boolean;
  error: string | null;
}

export function useSitemapEntries(): UseSitemapEntriesReturn {
  const { data: entries = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['sitemap_entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sitemap_entries')
        .select('id, loc, changefreq, priority, lastmod, created_at, updated_at')
        .order('loc', { ascending: true });

      if (error) throw new Error(error.message);
      return (data ?? []) as SitemapEntry[];
    },
    enabled: isSupabaseConfigured,
  });

  const error = queryError instanceof Error ? queryError.message : null;

  return { entries, loading, error };
}

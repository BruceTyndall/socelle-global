import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useSitemapEntries — WO-OVERHAUL-03: Sitemap entries data hook ─────
// Fetches all entries from sitemap_entries table.
// Falls back gracefully when Supabase is unavailable.

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
  const [entries, setEntries] = useState<SitemapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchEntries() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setEntries([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('sitemap_entries')
          .select('id, loc, changefreq, priority, lastmod, created_at, updated_at')
          .order('loc', { ascending: true });

        if (cancelled) return;

        if (queryError || !data) {
          setEntries([]);
          if (queryError) setError(queryError.message);
        } else {
          setEntries(data as SitemapEntry[]);
        }
      } catch {
        if (!cancelled) {
          setEntries([]);
          setError('Failed to fetch sitemap entries');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchEntries();
    return () => { cancelled = true; };
  }, []);

  return { entries, loading, error };
}

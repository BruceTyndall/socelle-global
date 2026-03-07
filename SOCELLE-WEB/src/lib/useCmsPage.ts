import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useCmsPage — WO-OVERHAUL-03: CMS page data hook ──────────────────
// Fetches a published CMS page by slug from cms_pages table.
// Falls back gracefully when Supabase is unavailable.
// Returns isLive flag so UI can show DEMO/PREVIEW banners accordingly.

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  blocks: Record<string, unknown>[];
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

interface UseCmsPageReturn {
  page: CmsPage | null;
  isLive: boolean;
  loading: boolean;
  error: string | null;
}

export function useCmsPage(slug: string): UseCmsPageReturn {
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPage() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setPage(null);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('cms_pages')
          .select('id, slug, title, meta_title, meta_description, og_image_url, blocks, status, created_at, updated_at')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (cancelled) return;

        if (queryError || !data) {
          setPage(null);
          setIsLive(false);
          if (queryError) setError(queryError.message);
        } else {
          setPage(data as CmsPage);
          setIsLive(true);
        }
      } catch {
        if (!cancelled) {
          setPage(null);
          setIsLive(false);
          setError('Failed to fetch CMS page');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPage();
    return () => { cancelled = true; };
  }, [slug]);

  return { page, isLive, loading, error };
}

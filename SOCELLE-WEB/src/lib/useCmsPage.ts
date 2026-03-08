import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useCmsPage — WO-OVERHAUL-03: CMS page data hook ──────────────────
// Fetches a published CMS page by slug from cms_pages table.
// Falls back gracefully when Supabase is unavailable.
// Returns isLive flag so UI can show DEMO/PREVIEW banners accordingly.
// Migrated to TanStack Query v5 (V2-TECH-04).

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
  const { data: page = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['cms_page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('id, slug, title, meta_title, meta_description, og_image_url, blocks, status, created_at, updated_at')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw new Error(error.message);
      return (data as CmsPage) ?? null;
    },
    enabled: isSupabaseConfigured && !!slug,
  });

  const isLive = page !== null;
  const error = queryError instanceof Error ? queryError.message : null;

  return { page, isLive, loading, error };
}

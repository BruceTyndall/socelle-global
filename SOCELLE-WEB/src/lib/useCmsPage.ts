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

interface CmsPageRow {
  id: string;
  slug: string;
  title: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image: string | null;
  metadata: unknown;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useCmsPage(slug: string): UseCmsPageReturn {
  const { data: page = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['cms_page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('id, slug, title, seo_title, seo_description, seo_og_image, metadata, status, created_at, updated_at')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) {
        console.warn('[useCmsPage] fetch error:', error.message);
        return null;
      }
      if (!data) return null;

      const row = data as CmsPageRow;
      const metadata =
        row.metadata && typeof row.metadata === 'object'
          ? (row.metadata as Record<string, unknown>)
          : null;

      const blocks = Array.isArray(metadata?.blocks)
        ? (metadata?.blocks as Record<string, unknown>[])
        : [];

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        meta_title: row.seo_title,
        meta_description: row.seo_description,
        og_image_url: row.seo_og_image,
        blocks,
        status: 'published',
        created_at: row.created_at,
        updated_at: row.updated_at,
      } satisfies CmsPage;
    },
    enabled: isSupabaseConfigured && !!slug,
  });

  const isLive = page !== null;
  const error = queryError instanceof Error ? queryError.message : null;

  return { page, isLive, loading, error };
}

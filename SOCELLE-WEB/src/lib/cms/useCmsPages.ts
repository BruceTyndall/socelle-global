import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import type { CmsPage, CmsPageInsert, CmsPageUpdate, CmsPageWithBlocks } from './types';

// ── useCmsPages — WO-CMS-02: CMS pages hook ─────────────────────────
// CRUD for cms_pages table (V3 schema with space_id, template_id, SEO fields).
// Public: read published only. Admin: full CRUD.

const QUERY_KEY = 'cms_pages_v3';

interface UseCmsPagesOptions {
  spaceId?: string;
  spaceSlug?: string;
  status?: string;
}

export function useCmsPages(options: UseCmsPagesOptions = {}) {
  const queryClient = useQueryClient();
  const { spaceId, spaceSlug, status } = options;

  const { data: pages = [], isLoading, error: queryError } = useQuery({
    queryKey: [QUERY_KEY, spaceId, spaceSlug, status],
    queryFn: async () => {
      let query = supabase.from('cms_pages').select(`
        *,
        space:cms_spaces!cms_pages_space_id_fkey(slug, name)
      `);

      if (spaceId) query = query.eq('space_id', spaceId);
      if (status) query = query.eq('status', status);

      query = query.order('updated_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01') return [];
        throw new Error(error.message);
      }

      if (spaceSlug && data) {
        return data.filter(
          (p: Record<string, unknown>) =>
            (p.space as Record<string, unknown> | null)?.slug === spaceSlug
        ) as CmsPage[];
      }

      return (data ?? []) as CmsPage[];
    },
    enabled: isSupabaseConfigured,
  });

  const isLive = pages.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  const createPage = useMutation({
    mutationFn: async (input: CmsPageInsert) => {
      const { data, error } = await supabase
        .from('cms_pages')
        .insert(input)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsPage;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updatePage = useMutation({
    mutationFn: async ({ id, ...updates }: CmsPageUpdate & { id: string }) => {
      const payload: Record<string, unknown> = { ...updates };
      if (updates.status === 'published' && !updates.published_at) {
        payload.published_at = new Date().toISOString();
      }
      const { data, error } = await supabase
        .from('cms_pages')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsPage;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cms_pages').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return { pages, isLive, isLoading, error, createPage, updatePage, deletePage };
}

export function useCmsPageBySlug(slug: string, spaceSlug?: string) {
  const { data: page = null, isLoading, error: queryError } = useQuery({
    queryKey: [QUERY_KEY, 'by-slug', slug, spaceSlug],
    queryFn: async () => {
      let query = supabase
        .from('cms_pages')
        .select(`
          *,
          space:cms_spaces!cms_pages_space_id_fkey(slug, name)
        `)
        .eq('slug', slug)
        .eq('status', 'published');

      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01') return null;
        throw new Error(error.message);
      }

      if (!data || data.length === 0) return null;

      if (spaceSlug) {
        const match = data.find(
          (p: Record<string, unknown>) =>
            (p.space as Record<string, unknown> | null)?.slug === spaceSlug
        );
        return (match as CmsPage) ?? null;
      }

      return (data[0] as CmsPage) ?? null;
    },
    enabled: isSupabaseConfigured && !!slug,
  });

  const isLive = page !== null;
  const error = queryError instanceof Error ? queryError.message : null;

  return { page, isLive, isLoading, error };
}

export function useCmsPageWithBlocks(pageId: string) {
  const { data: page = null, isLoading, error: queryError } = useQuery({
    queryKey: [QUERY_KEY, 'with-blocks', pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_pages')
        .select(`
          *,
          page_blocks:cms_page_blocks(
            *,
            block:cms_blocks(*)
          )
        `)
        .eq('id', pageId)
        .single();

      if (error) {
        if (error.code === '42P01') return null;
        throw new Error(error.message);
      }

      if (!data) return null;

      const typed = data as unknown as CmsPageWithBlocks;
      if (typed.page_blocks) {
        typed.page_blocks.sort((a, b) => a.position - b.position);
      }

      return typed;
    },
    enabled: isSupabaseConfigured && !!pageId,
  });

  const isLive = page !== null;
  const error = queryError instanceof Error ? queryError.message : null;

  return { page, isLive, isLoading, error };
}

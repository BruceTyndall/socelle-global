import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import type { CmsPost, CmsPostInsert, CmsPostUpdate } from './types';

// ── useCmsPosts — WO-CMS-02: CMS posts hook ─────────────────────────
// CRUD for cms_posts table. Posts are blog/brief/article entries.
// Public: read published only. Admin: full CRUD.

const QUERY_KEY = 'cms_posts';

interface UseCmsPostsOptions {
  spaceSlug?: string;
  spaceId?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  limit?: number;
}

export function useCmsPosts(options: UseCmsPostsOptions = {}) {
  const queryClient = useQueryClient();
  const { spaceSlug, spaceId, category, status, featured, limit } = options;

  const { data: posts = [], isLoading, error: queryError } = useQuery({
    queryKey: [QUERY_KEY, spaceSlug, spaceId, category, status, featured, limit],
    queryFn: async () => {
      let query = supabase.from('cms_posts').select(`
        *,
        space:cms_spaces!cms_posts_space_id_fkey(slug, name)
      `);

      if (spaceId) query = query.eq('space_id', spaceId);
      if (category) query = query.eq('category', category);
      if (status) query = query.eq('status', status);
      if (featured !== undefined) query = query.eq('featured', featured);

      query = query.order('published_at', { ascending: false, nullsFirst: false });

      if (limit) query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01') return [];
        throw new Error(error.message);
      }

      if (spaceSlug && data) {
        return data.filter(
          (p: Record<string, unknown>) =>
            (p.space as Record<string, unknown> | null)?.slug === spaceSlug
        ) as CmsPost[];
      }

      return (data ?? []) as CmsPost[];
    },
    enabled: isSupabaseConfigured,
  });

  const isLive = posts.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  const createPost = useMutation({
    mutationFn: async (input: CmsPostInsert) => {
      const { data, error } = await supabase
        .from('cms_posts')
        .insert(input)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsPost;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updatePost = useMutation({
    mutationFn: async ({ id, ...updates }: CmsPostUpdate & { id: string }) => {
      const payload: Record<string, unknown> = { ...updates };
      if (updates.status === 'published' && !updates.published_at) {
        payload.published_at = new Date().toISOString();
      }
      const { data, error } = await supabase
        .from('cms_posts')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsPost;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cms_posts').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return { posts, isLive, isLoading, error, createPost, updatePost, deletePost };
}

export function useCmsPostBySlug(slug: string, spaceSlug?: string) {
  const { data: post = null, isLoading, error: queryError } = useQuery({
    queryKey: [QUERY_KEY, 'by-slug', slug, spaceSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_posts')
        .select(`
          *,
          space:cms_spaces!cms_posts_space_id_fkey(slug, name)
        `)
        .eq('slug', slug)
        .eq('status', 'published');

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
        return (match as CmsPost) ?? null;
      }

      return (data[0] as CmsPost) ?? null;
    },
    enabled: isSupabaseConfigured && !!slug,
  });

  const isLive = post !== null;
  const error = queryError instanceof Error ? queryError.message : null;

  return { post, isLive, isLoading, error };
}

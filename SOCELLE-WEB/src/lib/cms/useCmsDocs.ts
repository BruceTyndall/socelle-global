import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import type { CmsDoc, CmsDocInsert, CmsDocUpdate } from './types';

// ── useCmsDocs — WO-CMS-02: CMS docs hook ───────────────────────────
// CRUD for cms_docs table. Docs are playbooks, SOPs, help articles.
// Authenticated: read published. Admin: full CRUD.

const QUERY_KEY = 'cms_docs';

interface UseCmsDocsOptions {
  spaceSlug?: string;
  spaceId?: string;
  category?: string;
  status?: string;
}

export function useCmsDocs(options: UseCmsDocsOptions = {}) {
  const queryClient = useQueryClient();
  const { spaceSlug, spaceId, category, status } = options;

  const { data: docs = [], isLoading, error: queryError } = useQuery({
    queryKey: [QUERY_KEY, spaceSlug, spaceId, category, status],
    queryFn: async () => {
      let query = supabase.from('cms_docs').select(`
        *,
        space:cms_spaces!cms_docs_space_id_fkey(slug, name)
      `);

      if (spaceId) query = query.eq('space_id', spaceId);
      if (category) query = query.eq('category', category);
      if (status) query = query.eq('status', status);

      query = query.order('updated_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01') return [];
        throw new Error(error.message);
      }

      if (spaceSlug && data) {
        return data.filter(
          (d: Record<string, unknown>) =>
            (d.space as Record<string, unknown> | null)?.slug === spaceSlug
        ) as CmsDoc[];
      }

      return (data ?? []) as CmsDoc[];
    },
    enabled: isSupabaseConfigured,
  });

  const isLive = docs.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  const createDoc = useMutation({
    mutationFn: async (input: CmsDocInsert) => {
      const { data, error } = await supabase
        .from('cms_docs')
        .insert(input)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsDoc;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updateDoc = useMutation({
    mutationFn: async ({ id, ...updates }: CmsDocUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('cms_docs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsDoc;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deleteDoc = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cms_docs').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return { docs, isLive, isLoading, error, createDoc, updateDoc, deleteDoc };
}

export function useCmsDocBySlug(slug: string, spaceSlug?: string) {
  const { data: doc = null, isLoading, error: queryError } = useQuery({
    queryKey: [QUERY_KEY, 'by-slug', slug, spaceSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_docs')
        .select(`
          *,
          space:cms_spaces!cms_docs_space_id_fkey(slug, name)
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
          (d: Record<string, unknown>) =>
            (d.space as Record<string, unknown> | null)?.slug === spaceSlug
        );
        return (match as CmsDoc) ?? null;
      }

      return (data[0] as CmsDoc) ?? null;
    },
    enabled: isSupabaseConfigured && !!slug,
  });

  const isLive = doc !== null;
  const error = queryError instanceof Error ? queryError.message : null;

  return { doc, isLive, isLoading, error };
}

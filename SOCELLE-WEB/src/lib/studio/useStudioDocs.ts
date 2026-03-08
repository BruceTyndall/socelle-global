// ── useStudioDocs — WO-CMS-05: Authoring Studio documents hook ──────
// TanStack Query hook for studio documents backed by cms_docs table.
// Filters by author_id for the current user. CRUD + publish/archive.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useAuth } from '../auth';
import type { CmsDoc, CmsDocInsert, CmsDocUpdate, CmsStatus } from '../cms/types';

const QUERY_KEY = 'studio_docs';

export type StudioDocType = 'document' | 'course';

interface UseStudioDocsOptions {
  status?: CmsStatus;
  category?: string;
  docType?: StudioDocType;
}

export function useStudioDocs(options: UseStudioDocsOptions = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { status, category, docType } = options;

  const {
    data: docs = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: [QUERY_KEY, user?.id, status, category, docType],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('cms_docs')
        .select('*')
        .eq('author_id', user.id);

      if (status) query = query.eq('status', status);
      if (category) query = query.eq('category', category);
      if (docType) {
        query = query.eq(
          'category',
          docType === 'course' ? 'course' : 'document'
        );
      }

      query = query.order('updated_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01') return [];
        throw new Error(error.message);
      }

      return (data ?? []) as CmsDoc[];
    },
    enabled: isSupabaseConfigured && !!user?.id,
  });

  const isLive = docs.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  const createDoc = useMutation({
    mutationFn: async (
      input: Omit<CmsDocInsert, 'author_id'> & { author_id?: string }
    ) => {
      const payload: CmsDocInsert = {
        ...input,
        author_id: input.author_id ?? user?.id ?? null,
      };
      const { data, error } = await supabase
        .from('cms_docs')
        .insert(payload)
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

  const publishDoc = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('cms_docs')
        .update({ status: 'published' as CmsStatus })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsDoc;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const archiveDoc = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('cms_docs')
        .update({ status: 'archived' as CmsStatus })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsDoc;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    docs,
    isLive,
    isLoading,
    error,
    createDoc,
    updateDoc,
    deleteDoc,
    publishDoc,
    archiveDoc,
  };
}

export function useStudioDoc(id: string) {
  const {
    data: doc = null,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: [QUERY_KEY, 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_docs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === '42P01') return null;
        throw new Error(error.message);
      }
      return (data as CmsDoc) ?? null;
    },
    enabled: isSupabaseConfigured && !!id,
  });

  const isLive = doc !== null;
  const error = queryError instanceof Error ? queryError.message : null;

  return { doc, isLive, isLoading, error };
}

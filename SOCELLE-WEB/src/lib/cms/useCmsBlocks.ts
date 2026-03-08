import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import type { CmsBlock, CmsBlockInsert, CmsBlockUpdate } from './types';

// ── useCmsBlocks — WO-CMS-02: CMS blocks hook ───────────────────────
// CRUD for cms_blocks table. Supports block library (is_reusable=true).

const QUERY_KEY = 'cms_blocks';

interface UseCmsBlocksOptions {
  reusableOnly?: boolean;
  type?: string;
}

export function useCmsBlocks(options: UseCmsBlocksOptions = {}) {
  const queryClient = useQueryClient();
  const { reusableOnly, type } = options;

  const { data: blocks = [], isLoading, error: queryError } = useQuery({
    queryKey: [QUERY_KEY, reusableOnly, type],
    queryFn: async () => {
      let query = supabase.from('cms_blocks').select('*');

      if (reusableOnly) query = query.eq('is_reusable', true);
      if (type) query = query.eq('type', type);

      query = query.order('updated_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01') return [];
        throw new Error(error.message);
      }
      return (data ?? []) as CmsBlock[];
    },
    enabled: isSupabaseConfigured,
  });

  const isLive = blocks.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  const createBlock = useMutation({
    mutationFn: async (input: CmsBlockInsert) => {
      const { data, error } = await supabase
        .from('cms_blocks')
        .insert(input)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsBlock;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updateBlock = useMutation({
    mutationFn: async ({ id, ...updates }: CmsBlockUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('cms_blocks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsBlock;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deleteBlock = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cms_blocks').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return { blocks, isLive, isLoading, error, createBlock, updateBlock, deleteBlock };
}

export function useCmsBlock(id: string) {
  const { data: block = null, isLoading, error: queryError } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_blocks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === '42P01') return null;
        throw new Error(error.message);
      }
      return (data as CmsBlock) ?? null;
    },
    enabled: isSupabaseConfigured && !!id,
  });

  const isLive = block !== null;
  const error = queryError instanceof Error ? queryError.message : null;

  return { block, isLive, isLoading, error };
}

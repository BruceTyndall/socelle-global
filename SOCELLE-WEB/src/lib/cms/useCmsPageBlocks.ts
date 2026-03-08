import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import type { CmsPageBlock, CmsBlock } from './types';
import type { Json } from '../database.types';

// ── useCmsPageBlocks — WO-CMS-02: Page-block junction hook ───────────
// Manages page → block relationships with position ordering.

const QUERY_KEY = 'cms_page_blocks';

interface PageBlockWithBlock extends CmsPageBlock {
  block: CmsBlock;
}

export function useCmsPageBlocks(pageId: string) {
  const queryClient = useQueryClient();

  const { data: pageBlocks = [], isLoading, error: queryError } = useQuery({
    queryKey: [QUERY_KEY, pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_page_blocks')
        .select(`
          *,
          block:cms_blocks(*)
        `)
        .eq('page_id', pageId)
        .order('position');

      if (error) {
        if (error.code === '42P01') return [];
        throw new Error(error.message);
      }
      return (data ?? []) as PageBlockWithBlock[];
    },
    enabled: isSupabaseConfigured && !!pageId,
  });

  const isLive = pageBlocks.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  const addBlock = useMutation({
    mutationFn: async (input: { blockId: string; position: number; overrides?: Json }) => {
      const { data, error } = await supabase
        .from('cms_page_blocks')
        .insert({
          page_id: pageId,
          block_id: input.blockId,
          position: input.position,
          overrides: input.overrides ?? {},
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsPageBlock;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, pageId] });
      queryClient.invalidateQueries({ queryKey: ['cms_pages_v3'] });
    },
  });

  const removeBlock = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cms_page_blocks').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, pageId] });
      queryClient.invalidateQueries({ queryKey: ['cms_pages_v3'] });
    },
  });

  const reorderBlocks = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) =>
        supabase.from('cms_page_blocks').update({ position: index }).eq('id', id)
      );
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw new Error(failed.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, pageId] });
      queryClient.invalidateQueries({ queryKey: ['cms_pages_v3'] });
    },
  });

  const updateOverrides = useMutation({
    mutationFn: async ({ id, overrides }: { id: string; overrides: Json }) => {
      const { data, error } = await supabase
        .from('cms_page_blocks')
        .update({ overrides })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsPageBlock;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, pageId] });
    },
  });

  return { pageBlocks, isLive, isLoading, error, addBlock, removeBlock, reorderBlocks, updateOverrides };
}

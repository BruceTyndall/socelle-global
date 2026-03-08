import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import type { CmsSpace, CmsSpaceInsert, CmsSpaceUpdate } from './types';

// ── useCmsSpaces — WO-CMS-02: CMS spaces hook ───────────────────────
// CRUD for cms_spaces table. Spaces scope content to hubs.
// Public: read all. Admin: full CRUD.

const QUERY_KEY = 'cms_spaces';

export function useCmsSpaces() {
  const queryClient = useQueryClient();

  const { data: spaces = [], isLoading, error: queryError } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_spaces')
        .select('*')
        .order('name');

      if (error) {
        if (error.code === '42P01') return [] as CmsSpace[];
        throw new Error(error.message);
      }
      return (data ?? []) as CmsSpace[];
    },
    enabled: isSupabaseConfigured,
  });

  const isLive = spaces.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  const createSpace = useMutation({
    mutationFn: async (input: CmsSpaceInsert) => {
      const { data, error } = await supabase
        .from('cms_spaces')
        .insert(input)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsSpace;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updateSpace = useMutation({
    mutationFn: async ({ id, ...updates }: CmsSpaceUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('cms_spaces')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsSpace;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deleteSpace = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cms_spaces').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return { spaces, isLive, isLoading, error, createSpace, updateSpace, deleteSpace };
}

export function useCmsSpaceBySlug(slug: string) {
  const { data: space = null, isLoading, error: queryError } = useQuery({
    queryKey: [QUERY_KEY, slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_spaces')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === '42P01') return null;
        throw new Error(error.message);
      }
      return (data as CmsSpace) ?? null;
    },
    enabled: isSupabaseConfigured && !!slug,
  });

  const isLive = space !== null;
  const error = queryError instanceof Error ? queryError.message : null;

  return { space, isLive, isLoading, error };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import type { CmsTemplate, CmsTemplateInsert, CmsTemplateUpdate } from './types';

// ── useCmsTemplates — WO-CMS-02: CMS templates hook ─────────────────
// CRUD for cms_templates table. Admin only (no public access).

const QUERY_KEY = 'cms_templates';

export function useCmsTemplates() {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading, error: queryError } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_templates')
        .select('*')
        .order('name');

      if (error) {
        if (error.code === '42P01') return [];
        throw new Error(error.message);
      }
      return (data ?? []) as CmsTemplate[];
    },
    enabled: isSupabaseConfigured,
  });

  const isLive = templates.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  const createTemplate = useMutation({
    mutationFn: async (input: CmsTemplateInsert) => {
      const { data, error } = await supabase
        .from('cms_templates')
        .insert(input)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsTemplate;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: CmsTemplateUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('cms_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsTemplate;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cms_templates').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return { templates, isLive, isLoading, error, createTemplate, updateTemplate, deleteTemplate };
}

export function useCmsTemplate(idOrSlug: string) {
  const { data: template = null, isLoading, error: queryError } = useQuery({
    queryKey: [QUERY_KEY, idOrSlug],
    queryFn: async () => {
      // Try by ID first (UUID format), then by slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

      const { data, error } = await supabase
        .from('cms_templates')
        .select('*')
        .eq(isUuid ? 'id' : 'slug', idOrSlug)
        .single();

      if (error) {
        if (error.code === '42P01') return null;
        throw new Error(error.message);
      }
      return (data as CmsTemplate) ?? null;
    },
    enabled: isSupabaseConfigured && !!idOrSlug,
  });

  const isLive = template !== null;
  const error = queryError instanceof Error ? queryError.message : null;

  return { template, isLive, isLoading, error };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

// ── WO-OVERHAUL-15: Marketing Platform — Content Templates hook ──────
// Table: content_templates
// isLive flag drives DEMO badge.
// Migrated to TanStack Query v5 (V2-TECH-04).

export type TemplateType = 'email' | 'sms' | 'push' | 'in_app' | 'social' | 'landing_page';

export interface ContentTemplate {
  id: string;
  name: string;
  type: TemplateType;
  subject: string | null;
  preview_text: string | null;
  body: Record<string, unknown>;
  thumbnail_url: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface UseContentTemplatesReturn {
  templates: ContentTemplate[];
  isLive: boolean;
  loading: boolean;
  error: string | null;
  createTemplate: (template: Omit<ContentTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<ContentTemplate | null>;
  refetch: () => void;
}

export function useContentTemplates(typeFilter?: TemplateType): UseContentTemplatesReturn {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['content_templates', typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('content_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (typeFilter) {
        query = query.eq('type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data ?? []) as ContentTemplate[];
    },
    enabled: isSupabaseConfigured,
  });

  const createMutation = useMutation({
    mutationFn: async (template: Omit<ContentTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('content_templates')
        .insert(template)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as ContentTemplate;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['content_templates'] }); },
  });

  const createTemplate = async (template: Omit<ContentTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ContentTemplate | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      return await createMutation.mutateAsync(template);
    } catch {
      return null;
    }
  };

  const isLive = templates.length > 0;
  const error = queryError instanceof Error ? queryError.message
    : createMutation.error instanceof Error ? createMutation.error.message
    : null;

  return { templates, isLive, loading, error, createTemplate, refetch };
}

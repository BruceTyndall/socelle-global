import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';
import { useAuth } from './auth';

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

type TemplateRow = Record<string, unknown>;

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function isSchemaMismatch(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const message = (error as { message?: string }).message?.toLowerCase() ?? '';
  return (
    message.includes('column') ||
    message.includes('relationship') ||
    message.includes('schema cache') ||
    message.includes('does not exist')
  );
}

function mapTemplateRow(row: TemplateRow): ContentTemplate {
  const bodyFromRow = row.body;
  const bodyFromLegacy = row.html_body;
  const body =
    bodyFromRow && typeof bodyFromRow === 'object' && !Array.isArray(bodyFromRow)
      ? (bodyFromRow as Record<string, unknown>)
      : typeof bodyFromLegacy === 'string'
        ? { html: bodyFromLegacy, content: bodyFromLegacy }
        : {};

  return {
    id: asString(row.id),
    name: asString(row.name),
    type: asString(row.type) as TemplateType,
    subject: asNullableString(row.subject),
    preview_text: asNullableString(row.preview_text),
    body,
    thumbnail_url: asNullableString(row.thumbnail_url),
    is_system: typeof row.is_system === 'boolean' ? row.is_system : false,
    created_at: asString(row.created_at),
    updated_at: asString(row.updated_at),
  };
}

export function useContentTemplates(typeFilter?: TemplateType): UseContentTemplatesReturn {
  const queryClient = useQueryClient();
  const { profile, isAdmin, isPlatformAdmin } = useAuth();
  const isGlobalAdmin = isAdmin || isPlatformAdmin;

  const { data: templates = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['content_templates', typeFilter],
    queryFn: async () => {
      const runQuery = async (scopeByTenant: boolean) => {
        let query = supabase
          .from('content_templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (typeFilter) {
          query = query.eq('type', typeFilter);
        }

        if (scopeByTenant && profile?.business_id) {
          query = query.or(`is_system.eq.true,tenant_id.eq.${profile.business_id}`);
        }

        return query;
      };

      const scoped = !isGlobalAdmin;
      const scopedResult = await runQuery(scoped);
      if (!scopedResult.error) {
        return ((scopedResult.data ?? []) as TemplateRow[]).map(mapTemplateRow);
      }
      if (!(scoped && isSchemaMismatch(scopedResult.error))) {
        throw new Error(scopedResult.error.message);
      }

      const fallback = await runQuery(false);
      if (fallback.error) throw new Error(fallback.error.message);
      return ((fallback.data ?? []) as TemplateRow[]).map(mapTemplateRow);
    },
    enabled: isSupabaseConfigured,
  });

  const createMutation = useMutation({
    mutationFn: async (template: Omit<ContentTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const legacyInsert = await supabase
        .from('content_templates')
        .insert(template)
        .select()
        .single();
      if (!legacyInsert.error && legacyInsert.data) {
        return mapTemplateRow(legacyInsert.data as TemplateRow);
      }
      if (legacyInsert.error && !isSchemaMismatch(legacyInsert.error)) {
        throw new Error(legacyInsert.error.message);
      }

      const normalizedInsert = await supabase
        .from('content_templates')
        .insert({
          name: template.name,
          type: template.type,
          thumbnail_url: template.thumbnail_url ?? null,
          html_body:
            typeof template.body?.html === 'string'
              ? template.body.html
              : typeof template.body?.content === 'string'
                ? template.body.content
                : '',
          is_system: template.is_system ?? false,
          tenant_id: profile?.business_id ?? null,
        })
        .select()
        .single();
      if (normalizedInsert.error) throw new Error(normalizedInsert.error.message);
      return mapTemplateRow(normalizedInsert.data as TemplateRow);
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

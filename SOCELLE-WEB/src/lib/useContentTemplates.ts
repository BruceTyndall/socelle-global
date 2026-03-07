import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// ── WO-OVERHAUL-15: Marketing Platform — Content Templates hook ──────
// Table: content_templates
// isLive flag drives DEMO badge.

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
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchTemplates() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setTemplates([]);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('content_templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (typeFilter) {
          query = query.eq('type', typeFilter);
        }

        const { data, error: queryError } = await query;

        if (cancelled) return;

        if (queryError || !data) {
          setTemplates([]);
          setIsLive(false);
          if (queryError) setError(queryError.message);
        } else {
          setTemplates(data as ContentTemplate[]);
          setIsLive(true);
        }
      } catch {
        if (!cancelled) {
          setTemplates([]);
          setIsLive(false);
          setError('Failed to fetch content templates');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTemplates();
    return () => { cancelled = true; };
  }, [typeFilter, tick]);

  const createTemplate = useCallback(async (template: Omit<ContentTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ContentTemplate | null> => {
    if (!isSupabaseConfigured) return null;
    const { data, error: insertError } = await supabase
      .from('content_templates')
      .insert(template)
      .select()
      .single();
    if (insertError) { setError(insertError.message); return null; }
    refetch();
    return data as ContentTemplate;
  }, [refetch]);

  return { templates, isLive, loading, error, createTemplate, refetch };
}

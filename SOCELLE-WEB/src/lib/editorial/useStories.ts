// ── useStories — W15-05 ───────────────────────────────────────────────
// Fetches published stories from the stories table.
// Data label: LIVE — stories table with RLS (public reads published only)
// Migrated to TanStack Query v5 (V2-TECH-04).

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';

// ── Types ─────────────────────────────────────────────────────────────

export interface Story {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  hero_image_url: string | null;
  author_name: string;
  status: 'draft' | 'published' | 'archived';
  category: string | null;
  tags: string[];
  related_signal_ids: string[];
  seo_title: string | null;
  seo_description: string | null;
  source_type: 'curated' | 'automated' | 'hybrid';
  reading_time_minutes: number | null;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UseStoriesReturn {
  stories: Story[];
  featured: Story[];
  loading: boolean;
  isLive: boolean;
}

export interface UseStoryDetailReturn {
  story: Story | null;
  loading: boolean;
  isLive: boolean;
  notFound: boolean;
}

// ── Select columns ────────────────────────────────────────────────────

const STORY_COLUMNS = 'id, title, slug, excerpt, body, hero_image_url, author_name, status, category, tags, related_signal_ids, seo_title, seo_description, source_type, reading_time_minutes, featured, published_at, created_at, updated_at';

// ── useStories: list of published stories ─────────────────────────────

export function useStories(options?: { limit?: number; category?: string }): UseStoriesReturn {
  const limit = options?.limit ?? 50;
  const category = options?.category;

  const { data: stories = [], isLoading: loading } = useQuery({
    queryKey: ['stories', { limit, category }],
    queryFn: async () => {
      let query = supabase
        .from('stories')
        .select(STORY_COLUMNS)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data ?? []) as Story[];
    },
    enabled: isSupabaseConfigured,
  });

  const isLive = stories.length > 0;
  const featured = useMemo(() => stories.filter((s) => s.featured), [stories]);

  return { stories, featured, loading, isLive };
}

// ── useStoryDetail: single story by slug ──────────────────────────────

export function useStoryDetail(slug: string | undefined): UseStoryDetailReturn {
  const { data: story = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['story_detail', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select(STORY_COLUMNS)
        .eq('slug', slug!)
        .eq('status', 'published')
        .single();

      if (error) throw new Error(error.message);
      return (data as Story) ?? null;
    },
    enabled: isSupabaseConfigured && !!slug,
  });

  const isLive = story !== null;
  const notFound = !loading && story === null && (!!queryError || !slug);

  return { story, loading, isLive, notFound };
}

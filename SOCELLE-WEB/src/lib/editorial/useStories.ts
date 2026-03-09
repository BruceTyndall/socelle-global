// ── useStories — W15-05 ───────────────────────────────────────────────
// Fetches published editorial stories from cms_posts.
// Data label: LIVE — cms_posts table (published rows)
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

interface CmsPostRow {
  id: string;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  body: string | null;
  hero_image: string | null;
  status: string | null;
  category: string | null;
  tags: string[] | null;
  source_type: string | null;
  reading_time: number | null;
  featured: boolean | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  metadata: unknown;
}

// ── Select columns ────────────────────────────────────────────────────

const POST_COLUMNS =
  'id, title, slug, excerpt, body, hero_image, status, category, tags, source_type, reading_time, featured, published_at, created_at, updated_at, seo_title, seo_description, metadata';

function normalizeSourceType(value: string | null): Story['source_type'] {
  if (value === 'automated' || value === 'hybrid' || value === 'curated') return value;
  return 'curated';
}

function normalizeStatus(value: string | null): Story['status'] {
  if (value === 'draft' || value === 'published' || value === 'archived') return value;
  return 'published';
}

function readAuthorName(metadata: unknown): string {
  if (!metadata || typeof metadata !== 'object') return 'Socelle Editorial';
  const author = (metadata as Record<string, unknown>).author_name;
  return typeof author === 'string' && author.trim() ? author : 'Socelle Editorial';
}

function readRelatedSignalIds(metadata: unknown): string[] {
  if (!metadata || typeof metadata !== 'object') return [];
  const related = (metadata as Record<string, unknown>).related_signal_ids;
  if (!Array.isArray(related)) return [];
  return related.filter((v): v is string => typeof v === 'string');
}

function mapPostToStory(row: CmsPostRow): Story {
  return {
    id: row.id,
    title: row.title ?? 'Untitled story',
    slug: row.slug ?? '',
    excerpt: row.excerpt,
    body: row.body,
    hero_image_url: row.hero_image,
    author_name: readAuthorName(row.metadata),
    status: normalizeStatus(row.status),
    category: row.category,
    tags: row.tags ?? [],
    related_signal_ids: readRelatedSignalIds(row.metadata),
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    source_type: normalizeSourceType(row.source_type),
    reading_time_minutes: row.reading_time,
    featured: Boolean(row.featured),
    published_at: row.published_at,
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? row.created_at ?? new Date().toISOString(),
  };
}

// ── useStories: list of published stories ─────────────────────────────

export function useStories(options?: { limit?: number; category?: string }): UseStoriesReturn {
  const limit = options?.limit ?? 50;
  const category = options?.category;

  const { data: stories = [], isLoading: loading } = useQuery({
    queryKey: ['stories', { limit, category }],
    queryFn: async () => {
      let query = supabase
        .from('cms_posts')
        .select(POST_COLUMNS)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('[useStories] fetch error:', error.message);
        return [];
      }
      return ((data ?? []) as CmsPostRow[]).map(mapPostToStory).filter((story) => story.slug);
    },
    enabled: isSupabaseConfigured,
  });

  const isLive = stories.length > 0;
  const featured = useMemo(() => stories.filter((s) => s.featured), [stories]);

  return { stories, featured, loading, isLive };
}

// ── useStoryDetail: single story by slug ──────────────────────────────

export function useStoryDetail(slug: string | undefined): UseStoryDetailReturn {
  const { data: story = null, isLoading: loading } = useQuery({
    queryKey: ['story_detail', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_posts')
        .select(POST_COLUMNS)
        .eq('slug', slug!)
        .eq('status', 'published')
        .maybeSingle();

      if (error) {
        console.warn('[useStoryDetail] fetch error:', error.message);
        return null;
      }
      if (!data) return null;
      const mapped = mapPostToStory(data as CmsPostRow);
      return mapped.slug ? mapped : null;
    },
    enabled: isSupabaseConfigured && !!slug,
  });

  const isLive = story !== null;
  const notFound = !loading && !!slug && story === null;

  return { story, loading, isLive, notFound };
}

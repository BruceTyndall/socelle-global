// ── useStories — W15-05 ───────────────────────────────────────────────
// Fetches published stories from the stories table.
// Data label: LIVE — stories table with RLS (public reads published only)

import { useState, useEffect, useMemo } from 'react';
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

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);

      if (!isSupabaseConfigured) {
        setStories([]);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
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

        if (cancelled) return;

        if (error || !data) {
          setStories([]);
          setIsLive(false);
        } else {
          setStories(data as Story[]);
          setIsLive(true);
        }
      } catch {
        if (!cancelled) {
          setStories([]);
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [limit, category]);

  const featured = useMemo(() => stories.filter((s) => s.featured), [stories]);

  return { stories, featured, loading, isLive };
}

// ── useStoryDetail: single story by slug ──────────────────────────────

export function useStoryDetail(slug: string | undefined): UseStoryDetailReturn {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setStory(null);
      setLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setNotFound(false);

      if (!isSupabaseConfigured) {
        setStory(null);
        setIsLive(false);
        setLoading(false);
        setNotFound(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('stories')
          .select(STORY_COLUMNS)
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (cancelled) return;

        if (error || !data) {
          setStory(null);
          setIsLive(false);
          setNotFound(true);
        } else {
          setStory(data as Story);
          setIsLive(true);
        }
      } catch {
        if (!cancelled) {
          setStory(null);
          setIsLive(false);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [slug]);

  return { story, loading, isLive, notFound };
}

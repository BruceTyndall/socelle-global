import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useBlogPosts / useBlogPost — WO-OVERHAUL-03: Blog data hooks ─────
// Fetches published blog posts from blog_posts table.
// Falls back gracefully when Supabase is unavailable.
// Returns isLive flag so UI can show DEMO/PREVIEW banners accordingly.

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: Record<string, unknown>[];
  tags: string[];
  author: string | null;
  status: 'draft' | 'published' | 'scheduled';
  featured_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UseBlogPostsOptions {
  tag?: string;
  limit?: number;
  featured?: boolean;
}

interface UseBlogPostsReturn {
  posts: BlogPost[];
  isLive: boolean;
  loading: boolean;
  error: string | null;
}

interface UseBlogPostReturn {
  post: BlogPost | null;
  isLive: boolean;
  loading: boolean;
  error: string | null;
}

export function useBlogPosts(options?: UseBlogPostsOptions): UseBlogPostsReturn {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tag = options?.tag;
  const limit = options?.limit ?? 50;
  const featured = options?.featured;

  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setPosts([]);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('blog_posts')
          .select('id, slug, title, excerpt, body, tags, author, status, featured_image_url, meta_title, meta_description, published_at, created_at, updated_at')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(limit);

        if (tag) {
          query = query.contains('tags', [tag]);
        }

        if (featured !== undefined) {
          query = query.eq('featured', featured);
        }

        const { data, error: queryError } = await query;

        if (cancelled) return;

        if (queryError || !data) {
          setPosts([]);
          setIsLive(false);
          if (queryError) setError(queryError.message);
        } else {
          setPosts(data as BlogPost[]);
          setIsLive(data.length > 0);
        }
      } catch {
        if (!cancelled) {
          setPosts([]);
          setIsLive(false);
          setError('Failed to fetch blog posts');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPosts();
    return () => { cancelled = true; };
  }, [tag, limit, featured]);

  return { posts, isLive, loading, error };
}

export function useBlogPost(slug: string): UseBlogPostReturn {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPost() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setPost(null);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('blog_posts')
          .select('id, slug, title, excerpt, body, tags, author, status, featured_image_url, meta_title, meta_description, published_at, created_at, updated_at')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (cancelled) return;

        if (queryError || !data) {
          setPost(null);
          setIsLive(false);
          if (queryError) setError(queryError.message);
        } else {
          setPost(data as BlogPost);
          setIsLive(true);
        }
      } catch {
        if (!cancelled) {
          setPost(null);
          setIsLive(false);
          setError('Failed to fetch blog post');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPost();
    return () => { cancelled = true; };
  }, [slug]);

  return { post, isLive, loading, error };
}

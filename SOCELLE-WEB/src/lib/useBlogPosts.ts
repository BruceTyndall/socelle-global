import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useBlogPosts / useBlogPost — WO-OVERHAUL-03: Blog data hooks ─────
// Fetches published blog posts from blog_posts table.
// Falls back gracefully when Supabase is unavailable.
// Returns isLive flag so UI can show DEMO/PREVIEW banners accordingly.
// Migrated to TanStack Query v5 (V2-TECH-04).

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
  const tag = options?.tag;
  const limit = options?.limit ?? 50;
  const featured = options?.featured;

  const { data: posts = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['blog_posts', { tag, limit, featured }],
    queryFn: async () => {
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

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data ?? []) as BlogPost[];
    },
    enabled: isSupabaseConfigured,
  });

  const isLive = posts.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { posts, isLive, loading, error };
}

export function useBlogPost(slug: string): UseBlogPostReturn {
  const { data: post = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['blog_post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, body, tags, author, status, featured_image_url, meta_title, meta_description, published_at, created_at, updated_at')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw new Error(error.message);
      return (data as BlogPost) ?? null;
    },
    enabled: isSupabaseConfigured && !!slug,
  });

  const isLive = post !== null;
  const error = queryError instanceof Error ? queryError.message : null;

  return { post, isLive, loading, error };
}

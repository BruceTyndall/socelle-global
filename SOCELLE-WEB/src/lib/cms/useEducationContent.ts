import { useCmsPosts, useCmsPostBySlug } from './useCmsPosts';

// ── useEducationContent — WO-CMS-06: Education Hub integration ──────
// Thin wrapper over useCmsPosts filtered to space='education'.
// Returns education articles/guides from cms_posts for the Education Hub.

const SPACE = 'education';

interface UseEducationContentOptions {
  category?: string;
  status?: string;
  featured?: boolean;
  limit?: number;
}

export function useEducationContent(options: UseEducationContentOptions = {}) {
  const result = useCmsPosts({ spaceSlug: SPACE, ...options });
  return {
    articles: result.posts,
    isLive: result.isLive,
    isLoading: result.isLoading,
    error: result.error,
    createArticle: result.createPost,
    updateArticle: result.updatePost,
    deleteArticle: result.deletePost,
  };
}

export function useEducationArticleBySlug(slug: string) {
  return useCmsPostBySlug(slug, SPACE);
}

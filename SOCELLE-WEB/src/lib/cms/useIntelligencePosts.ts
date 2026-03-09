import { useCmsPosts, useCmsPostBySlug } from './useCmsPosts';

// ── useIntelligencePosts — WO-CMS-06: Intelligence Hub integration ───
// Thin wrapper over useCmsPosts filtered to space='intelligence'.
// Returns intelligence briefs/articles from cms_posts for the Intelligence Hub.

const SPACE = 'intelligence';

interface UseIntelligencePostsOptions {
  category?: string;
  status?: string;
  featured?: boolean;
  limit?: number;
}

export function useIntelligencePosts(options: UseIntelligencePostsOptions = {}) {
  const result = useCmsPosts({ spaceSlug: SPACE, ...options });
  return {
    briefs: result.posts,
    isLive: result.isLive,
    isLoading: result.isLoading,
    error: result.error,
    createBrief: result.createPost,
    updateBrief: result.updatePost,
    deleteBrief: result.deletePost,
  };
}

export function useIntelligenceBriefBySlug(slug: string) {
  return useCmsPostBySlug(slug, SPACE);
}

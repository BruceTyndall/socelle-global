import { useCmsPosts, useCmsPostBySlug } from './useCmsPosts';

// ── useJobsContent — WO-CMS-06: Jobs Hub integration ────────────────
// Thin wrapper over useCmsPosts filtered to space='jobs'.
// Returns career guides and job market articles from cms_posts for the Jobs Hub.

const SPACE = 'jobs';

interface UseJobsContentOptions {
  category?: string;
  status?: string;
  featured?: boolean;
  limit?: number;
}

export function useJobsContent(options: UseJobsContentOptions = {}) {
  const result = useCmsPosts({ spaceSlug: SPACE, ...options });
  return {
    guides: result.posts,
    isLive: result.isLive,
    isLoading: result.isLoading,
    error: result.error,
    createGuide: result.createPost,
    updateGuide: result.updatePost,
    deleteGuide: result.deletePost,
  };
}

export function useJobsGuideBySlug(slug: string) {
  return useCmsPostBySlug(slug, SPACE);
}

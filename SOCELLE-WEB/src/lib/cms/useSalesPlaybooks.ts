import { useCmsDocs, useCmsDocBySlug } from './useCmsDocs';

// ── useSalesPlaybooks — WO-CMS-06: Sales Hub integration ────────────
// Thin wrapper over useCmsDocs filtered to space='sales'.
// Returns sales playbooks/proposal templates from cms_docs for the Sales Hub.

const SPACE = 'sales';

interface UseSalesPlaybooksOptions {
  category?: string;
  status?: string;
}

export function useSalesPlaybooks(options: UseSalesPlaybooksOptions = {}) {
  const result = useCmsDocs({ spaceSlug: SPACE, ...options });
  return {
    playbooks: result.docs,
    isLive: result.isLive,
    isLoading: result.isLoading,
    error: result.error,
    createPlaybook: result.createDoc,
    updatePlaybook: result.updateDoc,
    deletePlaybook: result.deleteDoc,
  };
}

export function useSalesPlaybookBySlug(slug: string) {
  return useCmsDocBySlug(slug, SPACE);
}

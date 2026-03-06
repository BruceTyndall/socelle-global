import { useState, useMemo } from 'react';
import { mockEducationContent, mockEducationProgress } from './mockContent';
import type {
  EducationContent,
  EducationProgress,
  EducationFilterKey,
  ContentTypeFilter,
  DifficultyFilter,
  SortKey,
  ContentCategory,
} from './types';

// ── Category metadata ───────────────────────────────────────────────

export const CATEGORY_LABELS: Record<ContentCategory, string> = {
  treatment_protocols: 'Treatment Protocols',
  ingredient_science: 'Ingredient Science',
  business_operations: 'Business Operations',
  compliance_regulatory: 'Compliance & Regulatory',
  device_training: 'Device Training',
  retail_strategy: 'Retail Strategy',
};

// ── Difficulty sort weight ──────────────────────────────────────────

const DIFFICULTY_ORDER: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

// ── Return type ─────────────────────────────────────────────────────

interface UseEducationReturn {
  content: EducationContent[];
  allContent: EducationContent[];
  progress: EducationProgress[];
  loading: boolean;

  // Filters
  categoryFilter: EducationFilterKey;
  setCategoryFilter: (f: EducationFilterKey) => void;
  contentTypeFilter: ContentTypeFilter;
  setContentTypeFilter: (f: ContentTypeFilter) => void;
  difficultyFilter: DifficultyFilter;
  setDifficultyFilter: (f: DifficultyFilter) => void;
  ceOnlyFilter: boolean;
  setCeOnlyFilter: (v: boolean) => void;
  sortKey: SortKey;
  setSortKey: (k: SortKey) => void;

  // Derived
  categoryCounts: Record<ContentCategory, number>;
  totalCeCreditsAvailable: number;
  ceCreditsEarned: number;
  ceGoal: number;
}

// ── Hook ────────────────────────────────────────────────────────────

export function useEducation(): UseEducationReturn {
  const [categoryFilter, setCategoryFilter] = useState<EducationFilterKey>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [ceOnlyFilter, setCeOnlyFilter] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('newest');

  const loading = false;
  const allContent = mockEducationContent;
  const progress = mockEducationProgress;

  // Category counts (all content, ignoring filters)
  const categoryCounts = useMemo(() => {
    const counts = {} as Record<ContentCategory, number>;
    for (const cat of Object.keys(CATEGORY_LABELS) as ContentCategory[]) {
      counts[cat] = allContent.filter((c) => c.category === cat).length;
    }
    return counts;
  }, [allContent]);

  // Total CE credits available
  const totalCeCreditsAvailable = useMemo(
    () =>
      allContent
        .filter((c) => c.ce_eligible && c.ce_credits)
        .reduce((sum, c) => sum + (c.ce_credits ?? 0), 0),
    [allContent],
  );

  // CE credits earned
  const ceCreditsEarned = useMemo(
    () => progress.reduce((sum, p) => sum + p.ce_credits_earned, 0),
    [progress],
  );

  // Filtered + sorted content
  const content = useMemo(() => {
    let filtered = [...allContent];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((c) => c.category === categoryFilter);
    }
    if (contentTypeFilter !== 'all') {
      filtered = filtered.filter((c) => c.content_type === contentTypeFilter);
    }
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((c) => c.difficulty === difficultyFilter);
    }
    if (ceOnlyFilter) {
      filtered = filtered.filter((c) => c.ce_eligible);
    }

    // Sort
    switch (sortKey) {
      case 'newest':
        filtered.sort(
          (a, b) =>
            new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
        );
        break;
      case 'ce_credits':
        filtered.sort((a, b) => (b.ce_credits ?? 0) - (a.ce_credits ?? 0));
        break;
      case 'difficulty':
        filtered.sort(
          (a, b) =>
            (DIFFICULTY_ORDER[a.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.difficulty] ?? 0),
        );
        break;
    }

    return filtered;
  }, [allContent, categoryFilter, contentTypeFilter, difficultyFilter, ceOnlyFilter, sortKey]);

  return {
    content,
    allContent,
    progress,
    loading,
    categoryFilter,
    setCategoryFilter,
    contentTypeFilter,
    setContentTypeFilter,
    difficultyFilter,
    setDifficultyFilter,
    ceOnlyFilter,
    setCeOnlyFilter,
    sortKey,
    setSortKey,
    categoryCounts,
    totalCeCreditsAvailable,
    ceCreditsEarned,
    ceGoal: 24,
  };
}

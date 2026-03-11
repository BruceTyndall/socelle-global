import { useState, useMemo, useCallback } from 'react';
import type { TreatmentProtocol, ProtocolCategory, SkillLevel, CEProgress } from './types';
import { getProtocols, getProtocolBySlug, getCEProgress as getMockCEProgress } from '../../__fixtures__/mockProtocols';

// ── Filter State ────────────────────────────────────────────────────

export interface ProtocolFilters {
  category: ProtocolCategory | 'all';
  skillLevel: SkillLevel | 'all';
  ceEligible: boolean;
  search: string;
}

const DEFAULT_FILTERS: ProtocolFilters = {
  category: 'all',
  skillLevel: 'all',
  ceEligible: false,
  search: '',
};

// ── Hook ────────────────────────────────────────────────────────────

export function useProtocols() {
  const [filters, setFilters] = useState<ProtocolFilters>(DEFAULT_FILTERS);
  const [localProtocols, setLocalProtocols] = useState<TreatmentProtocol[]>(getProtocols);

  const filteredProtocols = useMemo(() => {
    let result = localProtocols;

    if (filters.category !== 'all') {
      result = result.filter((p) => p.category === filters.category);
    }

    if (filters.skillLevel !== 'all') {
      result = result.filter((p) => p.skillLevel === filters.skillLevel);
    }

    if (filters.ceEligible) {
      result = result.filter((p) => p.ceEligible);
    }

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.skinConcerns.some((c) => c.toLowerCase().includes(q)) ||
          (p.brandName && p.brandName.toLowerCase().includes(q))
      );
    }

    return result;
  }, [localProtocols, filters]);

  const setCategory = useCallback((category: ProtocolCategory | 'all') => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setSkillLevel = useCallback((skillLevel: SkillLevel | 'all') => {
    setFilters((prev) => ({ ...prev, skillLevel }));
  }, []);

  const toggleCEEligible = useCallback(() => {
    setFilters((prev) => ({ ...prev, ceEligible: !prev.ceEligible }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const getBySlug = useCallback((slug: string) => {
    return getProtocolBySlug(slug);
  }, []);

  const getCEProgress = useCallback((): CEProgress => {
    return getMockCEProgress();
  }, []);

  // Admin CRUD (local state only) ──────────────────────────────────
  const addProtocol = useCallback((protocol: TreatmentProtocol) => {
    setLocalProtocols((prev) => [...prev, protocol]);
  }, []);

  const updateProtocol = useCallback((id: string, updates: Partial<TreatmentProtocol>) => {
    setLocalProtocols((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteProtocol = useCallback((id: string) => {
    setLocalProtocols((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    protocols: filteredProtocols,
    allProtocols: localProtocols,
    filters,
    setCategory,
    setSkillLevel,
    toggleCEEligible,
    setSearch,
    resetFilters,
    getBySlug,
    getCEProgress,
    addProtocol,
    updateProtocol,
    deleteProtocol,
  };
}

// ── Category & Skill-Level Label Helpers ────────────────────────────

export const CATEGORY_LABELS: Record<ProtocolCategory, string> = {
  facial: 'Facial',
  body: 'Body',
  wellness: 'Wellness',
  clinical: 'Clinical',
  oncology: 'Oncology',
};

export const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

/* ══════════════════════════════════════════════════════════════════
   useJobPostings — TanStack Query v5 hook for job_postings table
   V2-HUBS-02: Jobs Hub non-shell upgrade
   Columns: slug, title, company, location, vertical, type,
            salary_min, salary_max, salary_period, description,
            requirements, featured, posted_at, created_at, updated_at
   ══════════════════════════════════════════════════════════════════ */

// ── DB row (matches database.types.ts → job_postings) ────────────
export interface JobPostingRow {
  slug: string;
  title: string;
  company: string;
  location: string;
  vertical: string;
  type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: string;
  description: string;
  requirements: string[];
  featured: boolean;
  posted_at: string;
  created_at: string;
  updated_at: string;
}

// ── Filters ──────────────────────────────────────────────────────
export interface JobFilters {
  category?: string;   // vertical filter
  location?: string;
  type?: string;       // Full-time, Part-time, Contract, etc.
  salaryMin?: number;
  salaryMax?: number;
  search?: string;
}

// ── Market signal row (subset for talent intelligence) ───────────
export interface TalentSignalRow {
  id: string;
  title: string;
  description: string;
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  category: string | null;
  region: string | null;
  updated_at: string;
}

// ── List hook ────────────────────────────────────────────────────
export function useJobPostings(filters: JobFilters = {}) {
  const query = useQuery({
    queryKey: ['job_postings', filters],
    queryFn: async (): Promise<JobPostingRow[]> => {
      if (!isSupabaseConfigured) return [];

      let q = supabase
        .from('job_postings')
        .select('*')
        .order('featured', { ascending: false })
        .order('posted_at', { ascending: false });

      if (filters.category && filters.category !== 'All') {
        q = q.ilike('vertical', `%${filters.category}%`);
      }
      if (filters.location) {
        q = q.ilike('location', `%${filters.location}%`);
      }
      if (filters.type && filters.type !== 'All') {
        q = q.ilike('type', `%${filters.type}%`);
      }
      if (filters.salaryMin != null) {
        q = q.gte('salary_min', filters.salaryMin);
      }
      if (filters.salaryMax != null) {
        q = q.lte('salary_max', filters.salaryMax);
      }
      if (filters.search) {
        const s = `%${filters.search}%`;
        q = q.or(`title.ilike.${s},company.ilike.${s},location.ilike.${s},description.ilike.${s}`);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as JobPostingRow[];
    },
    staleTime: 60_000,
  });

  return {
    jobs: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    isLive: isSupabaseConfigured && !query.isLoading && !query.error && (query.data?.length ?? 0) > 0,
    refetch: query.refetch,
  };
}

// ── Detail hook (by slug) ────────────────────────────────────────
export function useJobDetail(slug: string | undefined) {
  const query = useQuery({
    queryKey: ['job_posting', slug],
    queryFn: async (): Promise<JobPostingRow | null> => {
      if (!isSupabaseConfigured || !slug) return null;

      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return (data as JobPostingRow) ?? null;
    },
    enabled: !!slug,
    staleTime: 60_000,
  });

  return {
    job: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    isLive: isSupabaseConfigured && !query.isLoading && !query.error && !!query.data,
  };
}

// ── Related jobs (same vertical, exclude current) ────────────────
export function useRelatedJobs(vertical: string | undefined, excludeSlug: string | undefined) {
  const query = useQuery({
    queryKey: ['related_jobs', vertical, excludeSlug],
    queryFn: async (): Promise<JobPostingRow[]> => {
      if (!isSupabaseConfigured || !vertical) return [];

      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .ilike('vertical', `%${vertical}%`)
        .neq('slug', excludeSlug ?? '')
        .order('posted_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return (data ?? []) as JobPostingRow[];
    },
    enabled: !!vertical,
    staleTime: 120_000,
  });

  return {
    relatedJobs: query.data ?? [],
    loading: query.isLoading,
  };
}

// ── Talent intelligence signals (market_signals matching job categories) ──
export function useTalentSignals() {
  const JOB_CATEGORIES = [
    'esthetician', 'stylist', 'medspa', 'provider', 'educator',
    'beauty', 'spa', 'dermatology', 'wellness', 'cosmetics',
  ];

  const query = useQuery({
    queryKey: ['talent_signals'],
    queryFn: async (): Promise<TalentSignalRow[]> => {
      if (!isSupabaseConfigured) return [];

      // Fetch recent active signals whose category overlaps with job-relevant terms
      const orFilter = JOB_CATEGORIES.map((c) => `category.ilike.%${c}%`).join(',');

      const { data, error } = await supabase
        .from('market_signals')
        .select('id, title, description, direction, magnitude, category, region, updated_at')
        .eq('active', true)
        .or(orFilter)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return (data ?? []) as TalentSignalRow[];
    },
    staleTime: 300_000,
  });

  return {
    signals: query.data ?? [],
    loading: query.isLoading,
    isLive: isSupabaseConfigured && !query.isLoading && !query.error && (query.data?.length ?? 0) > 0,
  };
}

// ── Helpers ──────────────────────────────────────────────────────
export function formatSalary(job: JobPostingRow): string {
  if (!job.salary_min && !job.salary_max) return 'Competitive';
  const fmt = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);
  const period = job.salary_period || 'year';
  if (job.salary_min && job.salary_max)
    return `${fmt(job.salary_min)} - ${fmt(job.salary_max)}/${period}`;
  if (job.salary_min) return `From ${fmt(job.salary_min)}/${period}`;
  return `Up to ${fmt(job.salary_max!)}/${period}`;
}

export function daysAgo(dateStr: string): number {
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

export function daysAgoLabel(days: number): string {
  if (days < 1) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function jobsToCsv(jobs: JobPostingRow[]): string {
  const header = 'Title,Company,Location,Type,Vertical,Salary Min,Salary Max,Salary Period,Posted,Description';
  const rows = jobs.map((j) =>
    [
      `"${j.title.replace(/"/g, '""')}"`,
      `"${j.company.replace(/"/g, '""')}"`,
      `"${j.location.replace(/"/g, '""')}"`,
      `"${j.type}"`,
      `"${j.vertical}"`,
      j.salary_min ?? '',
      j.salary_max ?? '',
      j.salary_period,
      j.posted_at,
      `"${j.description.replace(/"/g, '""').slice(0, 200)}"`,
    ].join(','),
  );
  return [header, ...rows].join('\n');
}

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  RefreshCw,
  ShieldAlert,
  AlertCircle,
  MapPin,
  Clock,
  DollarSign,
  Star,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ErrorState from '../../components/ErrorState';

// ── W12-11: Jobs Hub — Admin Control Center ───────────────────────────────
// Data source: job_postings table (LIVE)
// isLive = true when DB-connected; false fallback shows DEMO badge

interface JobPosting {
  id: string;
  slug: string;
  title: string;
  company: string;
  location: string;
  vertical: string;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: string;
  status: string;
  featured: boolean;
  source: string;
  created_at: string;
  updated_at: string;
  apply_url: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-amber-100 text-amber-800',
  filled: 'bg-blue-100 text-blue-800',
  expired: 'bg-accent-soft text-graphite',
  removed: 'bg-red-100 text-red-800',
};

const VERTICAL_COLORS: Record<string, string> = {
  spa: 'bg-teal-100 text-teal-800',
  medspa: 'bg-purple-100 text-purple-800',
  salon: 'bg-pink-100 text-pink-800',
  wellness: 'bg-cyan-100 text-cyan-800',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatSalary(min: number | null, max: number | null, period: string) {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const per = period === 'year' ? '/yr' : period === 'hour' ? '/hr' : `/${period}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}${per}`;
  if (min) return `From ${fmt(min)}${per}`;
  return `Up to ${fmt(max!)}${per}`;
}

export default function JobsHub() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('all');

  const { data: queryResult, isLoading: loading, error } = useQuery({
    queryKey: ['admin-jobs', filter],
    queryFn: async () => {
      let query = supabase
        .from('job_postings')
        .select('id, slug, title, company, location, vertical, employment_type, salary_min, salary_max, salary_period, status, featured, source, created_at, updated_at, apply_url')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error: dbError } = await query;
      if (dbError) {
        const msg = dbError.message?.toLowerCase() || '';
        if (msg.includes('does not exist') || dbError.code === '42P01') {
          return { rows: [] as JobPosting[], isLive: false };
        }
        throw dbError;
      }
      return { rows: (data ?? []) as JobPosting[], isLive: true };
    },
  });

  const rows = queryResult?.rows ?? [];
  const isLive = queryResult?.isLive ?? false;

  const loadData = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
  };

  if (error) {
    return (
      <ErrorState
        icon={ShieldAlert}
        title="Jobs Hub Unavailable"
        message="Failed to load jobs data."
        action={{ label: 'Retry', onClick: loadData }}
      />
    );
  }

  const activeCount = rows.filter((r) => r.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-sans text-graphite">
              Jobs Hub<span className="text-accent">.</span>
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">
            Job board management and posting administration
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft disabled:opacity-60 font-sans text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary */}
      {isLive && !loading && rows.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-white border border-accent-soft rounded-xl p-4">
            <p className="text-sm font-medium text-graphite/60 font-sans">Total Postings</p>
            <p className="mt-2 text-3xl font-sans text-graphite">{rows.length}</p>
          </div>
          <div className="bg-white border border-accent-soft rounded-xl p-4">
            <p className="text-sm font-medium text-graphite/60 font-sans">Active</p>
            <p className="mt-2 text-3xl font-sans text-graphite">{activeCount}</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-accent-soft/40 rounded-xl p-1 w-fit flex-wrap">
        {(['all', 'active', 'draft', 'filled', 'expired'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors ${
              filter === f
                ? 'bg-white text-graphite shadow-sm'
                : 'text-graphite/60 hover:text-graphite'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : !isLive ? (
        <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
          <Briefcase className="w-12 h-12 text-accent-soft mx-auto mb-4" />
          <h3 className="text-lg font-sans text-graphite mb-2">Jobs Hub</h3>
          <p className="text-graphite/60 font-sans text-sm max-w-md mx-auto">
            Job postings table not available in this environment. Connect Supabase to activate live jobs data.
          </p>
          <span className="inline-flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
            <AlertCircle className="w-3 h-3" />
            DEMO
          </span>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
          <Briefcase className="w-12 h-12 text-accent-soft mx-auto mb-4" />
          <p className="text-graphite/60 font-sans text-sm">
            {filter === 'all' ? 'No job postings yet.' : `No ${filter} postings.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((job) => {
            const salary = formatSalary(job.salary_min, job.salary_max, job.salary_period);
            return (
              <div key={job.id} className="bg-white border border-accent-soft rounded-xl overflow-hidden">
                {job.featured && <div className="h-1 bg-accent" />}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-lg bg-graphite flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-sans text-lg font-bold">
                        {job.company.charAt(0)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-graphite font-sans">{job.title}</h3>
                        {job.featured && (
                          <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[job.status] || 'bg-accent-soft text-graphite'}`}>
                          {job.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${VERTICAL_COLORS[job.vertical] || 'bg-accent-soft text-graphite'}`}>
                          {job.vertical}
                        </span>
                      </div>
                      <p className="text-xs text-graphite font-sans mb-1">{job.company}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-graphite/60 font-sans">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                        <span className="capitalize">{job.employment_type.replace(/_/g, ' ')}</span>
                        {salary && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {salary}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(job.created_at)}
                        </span>
                        {job.apply_url && (
                          <a
                            href={job.apply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-graphite transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Apply link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white border border-accent-soft rounded-xl p-5 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent-soft flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-accent-soft rounded w-1/3" />
              <div className="h-3 bg-accent-soft rounded w-1/2" />
              <div className="h-3 bg-accent-soft rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

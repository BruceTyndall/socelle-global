import { useEffect, useState, useCallback } from 'react';
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
  expired: 'bg-pro-stone text-pro-charcoal',
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
  const [rows, setRows] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('job_postings')
        .select('id, slug, title, company, location, vertical, employment_type, salary_min, salary_max, salary_period, status, featured, source, created_at, updated_at, apply_url')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error: dbError } = await query;
      if (dbError) throw dbError;
      setRows(data ?? []);
      setIsLive(true);
    } catch (err: any) {
      console.error('JobsHub: load error', err);
      const msg = err?.message?.toLowerCase() || '';
      if (msg.includes('does not exist') || err?.code === '42P01') {
        setIsLive(false);
        setRows([]);
      } else {
        setError('Failed to load jobs data.');
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error) {
    return (
      <ErrorState
        icon={ShieldAlert}
        title="Jobs Hub Unavailable"
        message={error}
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
            <h1 className="text-3xl font-serif text-pro-navy">
              Jobs Hub<span className="text-pro-gold">.</span>
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-pro-warm-gray font-sans mt-1">
            Job board management and posting administration
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-pro-stone text-pro-charcoal hover:bg-pro-cream disabled:opacity-60 font-sans text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary */}
      {isLive && !loading && rows.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-white border border-pro-stone rounded-xl p-4">
            <p className="text-sm font-medium text-pro-warm-gray font-sans">Total Postings</p>
            <p className="mt-2 text-3xl font-serif text-pro-navy">{rows.length}</p>
          </div>
          <div className="bg-white border border-pro-stone rounded-xl p-4">
            <p className="text-sm font-medium text-pro-warm-gray font-sans">Active</p>
            <p className="mt-2 text-3xl font-serif text-pro-navy">{activeCount}</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-pro-stone/40 rounded-xl p-1 w-fit flex-wrap">
        {(['all', 'active', 'draft', 'filled', 'expired'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors ${
              filter === f
                ? 'bg-white text-pro-navy shadow-sm'
                : 'text-pro-warm-gray hover:text-pro-charcoal'
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
        <div className="bg-white border border-pro-stone rounded-xl p-12 text-center">
          <Briefcase className="w-12 h-12 text-pro-stone mx-auto mb-4" />
          <h3 className="text-lg font-serif text-pro-navy mb-2">Jobs Hub</h3>
          <p className="text-pro-warm-gray font-sans text-sm max-w-md mx-auto">
            Job postings table not available in this environment. Connect Supabase to activate live jobs data.
          </p>
          <span className="inline-flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
            <AlertCircle className="w-3 h-3" />
            DEMO
          </span>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-pro-stone rounded-xl p-12 text-center">
          <Briefcase className="w-12 h-12 text-pro-stone mx-auto mb-4" />
          <p className="text-pro-warm-gray font-sans text-sm">
            {filter === 'all' ? 'No job postings yet.' : `No ${filter} postings.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((job) => {
            const salary = formatSalary(job.salary_min, job.salary_max, job.salary_period);
            return (
              <div key={job.id} className="bg-white border border-pro-stone rounded-xl overflow-hidden">
                {job.featured && <div className="h-1 bg-pro-gold" />}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-lg bg-pro-navy flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-serif text-lg font-bold">
                        {job.company.charAt(0)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-pro-navy font-sans">{job.title}</h3>
                        {job.featured && (
                          <Star className="w-3.5 h-3.5 text-pro-gold fill-pro-gold" />
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[job.status] || 'bg-pro-stone text-pro-charcoal'}`}>
                          {job.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${VERTICAL_COLORS[job.vertical] || 'bg-pro-stone text-pro-charcoal'}`}>
                          {job.vertical}
                        </span>
                      </div>
                      <p className="text-xs text-pro-charcoal font-sans mb-1">{job.company}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-pro-warm-gray font-sans">
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
                            className="flex items-center gap-1 hover:text-pro-navy transition-colors"
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
        <div key={i} className="bg-white border border-pro-stone rounded-xl p-5 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-pro-stone flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-pro-stone rounded w-1/3" />
              <div className="h-3 bg-pro-stone rounded w-1/2" />
              <div className="h-3 bg-pro-stone rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

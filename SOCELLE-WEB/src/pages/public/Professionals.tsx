/* ══════════════════════════════════════════════════════════════════
   Professionals.tsx — Professional Directory (V2-HUBS-04 Non-Shell)
   Data: LIVE from Supabase `user_profiles` table via TanStack Query v5
   Pearl Mineral V2 tokens only — no pro-*, no font-sans
   3 states: skeleton shimmer, empty with CTA, error with retry
   ══════════════════════════════════════════════════════════════════ */
import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Search,
  X,
  Users,
  AlertCircle,
  Download,
  MapPin,
  BadgeCheck,
  Briefcase,
  SlidersHorizontal,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import SiteFooter from '../../components/sections/SiteFooter';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfessionalRow {
  id: string;
  email: string | null;
  spa_name: string | null;
  role: string;
  created_at: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  business_user: 'Operator',
  spa_user: 'Practitioner',
  brand_admin: 'Brand Partner',
};

const ROLE_FILTER_OPTIONS = [
  { key: 'all', label: 'All Roles' },
  { key: 'business_user', label: 'Operators' },
  { key: 'spa_user', label: 'Practitioners' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest first' },
  { key: 'name', label: 'Name A\u2013Z' },
];

type SortKey = 'newest' | 'name';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfessionalGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-graphite/8 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full animate-pulse bg-mn-surface" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 rounded animate-pulse bg-mn-surface" />
              <div className="h-3 w-1/2 rounded animate-pulse bg-mn-surface" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded animate-pulse bg-mn-surface" />
            <div className="h-3 w-4/5 rounded animate-pulse bg-mn-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CSV Export ────────────────────────────────────────────────────────────────

function exportProfessionalsCSV(professionals: ProfessionalRow[]) {
  const headers = ['Name', 'Role', 'Member Since'];
  const rows = professionals.map((p) => [
    p.spa_name ?? 'Professional',
    ROLE_LABELS[p.role] ?? p.role,
    p.created_at ? new Date(p.created_at).toLocaleDateString() : '',
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `socelle-professionals-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useProfessionals() {
  return useQuery<ProfessionalRow[], Error>({
    queryKey: ['professionals', 'directory'],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        throw new Error('Platform is being configured. Check back soon.');
      }
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, spa_name, role, created_at, contact_email, contact_phone')
        .in('role', ['business_user', 'spa_user'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as ProfessionalRow[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getInitials(name: string | null): string {
  if (!name) return 'P';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getMemberSince(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

const pageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Professional Directory | Socelle',
  description:
    'Browse verified beauty and wellness professionals on Socelle. Licensed estheticians, medspa operators, and salon professionals.',
  url: 'https://socelle.com/professionals',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Professionals() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const { user } = useAuth();

  const {
    data: professionals = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useProfessionals();

  const error = queryError?.message ?? null;
  const isNetworkError =
    queryError instanceof Error &&
    (queryError.message.includes('fetch') || queryError.message.includes('network'));

  // ── Derived / filtered ───────────────────────────────────────

  const filteredProfessionals = useMemo(() => {
    let result = [...professionals];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.spa_name?.toLowerCase().includes(q) ?? false) ||
          (p.email?.toLowerCase().includes(q) ?? false)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter((p) => p.role === roleFilter);
    }

    // Sort
    switch (sortKey) {
      case 'name':
        result.sort((a, b) =>
          (a.spa_name ?? '').localeCompare(b.spa_name ?? '')
        );
        break;
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime()
        );
        break;
    }

    return result;
  }, [professionals, searchQuery, roleFilter, sortKey]);

  const handleExportCSV = useCallback(() => {
    exportProfessionalsCSV(filteredProfessionals);
  }, [filteredProfessionals]);

  const activeFilterCount = roleFilter !== 'all' ? 1 : 0;

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Professional Directory | Socelle</title>
        <meta
          name="description"
          content="Browse verified beauty and wellness professionals on Socelle. Licensed estheticians, medspa operators, and salon professionals."
        />
        <meta property="og:title" content="Professional Directory | Socelle" />
        <meta
          property="og:description"
          content="Browse verified beauty and wellness professionals."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/professionals" />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/professionals" />
        <script type="application/ld+json">
          {JSON.stringify(pageJsonLd)}
        </script>
      </Helmet>
      <MainNav />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-graphite">
        <div className="absolute inset-0 bg-gradient-to-b from-graphite/80 to-graphite" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BlockReveal>
            <p className="text-[0.8125rem] uppercase tracking-[0.12em] font-medium text-accent font-sans mb-4">
              Professional network
            </p>
          </BlockReveal>
          <WordReveal
            text="Professional Directory"
            as="h1"
            className="font-sans font-semibold text-hero text-white mb-5 justify-center"
          />
          <BlockReveal delay={200}>
            <p className="text-white/55 font-sans text-body max-w-2xl mx-auto mb-10">
              Browse verified beauty and wellness professionals. Licensed
              estheticians, medspa operators, and salon professionals using
              intelligence-driven practices.
            </p>
          </BlockReveal>
          <BlockReveal delay={350}>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  const el = document.getElementById('pro-search');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => el.focus(), 400);
                  }
                }}
                className="btn-mineral-primary"
              >
                Search Directory
              </button>
              <Link to="/intelligence" className="btn-mineral-glass">
                View Market Pulse
              </Link>
            </div>
          </BlockReveal>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Search + Export ─────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/40" />
            <input
              id="pro-search"
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-graphite/12 bg-white text-sm font-sans text-graphite placeholder:text-graphite/40 focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite/40 hover:text-graphite transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleExportCSV}
            disabled={filteredProfessionals.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-graphite/12 bg-white text-sm font-sans font-medium text-graphite/62 hover:border-graphite hover:text-graphite disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Export directory to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>

        {/* ── Filter bar ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters((f) => !f)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-sans font-medium border transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'bg-graphite text-white border-graphite'
                  : 'bg-white text-graphite/62 border-graphite/12 hover:border-graphite hover:text-graphite'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-0.5 w-4 h-4 bg-accent rounded-full text-white text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Role filter chips */}
            {ROLE_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setRoleFilter(opt.key)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium border transition-all ${
                  roleFilter === opt.key
                    ? 'bg-graphite text-white border-graphite'
                    : 'bg-white text-graphite/62 border-graphite/12 hover:border-graphite hover:text-graphite'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-graphite/42 font-sans">
              {filteredProfessionals.length} professional
              {filteredProfessionals.length !== 1 ? 's' : ''}
            </span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-sm font-sans text-graphite border border-graphite/12 rounded-lg px-3 py-1.5 bg-white focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Filter panel ───────────────────────────────────────── */}
        {showFilters && (
          <div className="bg-white border border-graphite/8 rounded-2xl p-5 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-sans font-semibold text-graphite text-sm">
                Filter professionals
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setRoleFilter('all')}
                  className="text-xs font-medium font-sans text-graphite/42 hover:text-graphite transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {ROLE_FILTER_OPTIONS.filter((o) => o.key !== 'all').map((opt) => (
                <label
                  key={opt.key}
                  className="inline-flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="role"
                    checked={roleFilter === opt.key}
                    onChange={() => setRoleFilter(opt.key)}
                    className="accent-graphite w-4 h-4"
                  />
                  <span className="text-sm font-sans text-graphite">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── Main content ───────────────────────────────────────── */}
        {error ? (
          <div className="max-w-2xl mx-auto">
            <div
              className={`border rounded-2xl p-6 ${
                isNetworkError
                  ? 'bg-red-50 border-red-200'
                  : 'bg-mn-surface border-graphite/8'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    isNetworkError ? 'text-red-600' : 'text-graphite'
                  }`}
                />
                <div>
                  <h3
                    className={`font-sans font-semibold mb-1 ${
                      isNetworkError ? 'text-red-900' : 'text-graphite'
                    }`}
                  >
                    {isNetworkError
                      ? 'Directory unavailable'
                      : 'Content being prepared'}
                  </h3>
                  <p
                    className={`text-sm font-sans mb-4 ${
                      isNetworkError ? 'text-red-700' : 'text-graphite/62'
                    }`}
                  >
                    {error}
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="btn-mineral-primary btn-mineral-sm"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : loading ? (
          <ProfessionalGridSkeleton />
        ) : filteredProfessionals.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-graphite/12 rounded-2xl">
            <Users className="w-14 h-14 text-graphite/20 mx-auto mb-4" />
            <h3 className="font-sans font-semibold text-lg text-graphite mb-2">
              No professionals found
            </h3>
            <p className="font-sans text-graphite/62 text-sm mb-4">
              {searchQuery
                ? `No professionals matching "${searchQuery}". Try a different search.`
                : 'No professionals in this area yet. Check back soon.'}
            </p>
            {(searchQuery || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                }}
                className="btn-mineral-accent btn-mineral-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Data status */}
            <div className="mb-8 pb-6 border-b border-graphite/8 text-center">
              <span className="text-[10px] font-semibold bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-full">
                LIVE
              </span>
              <p className="text-graphite/62 font-sans text-sm mt-2">
                {professionals.length} verified professionals on Socelle
              </p>
            </div>

            {/* Professional cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProfessionals.map((pro) => {
                const displayName = pro.spa_name ?? 'Professional';
                const roleLabel =
                  ROLE_LABELS[pro.role] ?? 'Professional';
                const memberSince = getMemberSince(pro.created_at);

                const personSchema = {
                  '@context': 'https://schema.org',
                  '@type': 'Person',
                  name: displayName,
                  jobTitle: roleLabel,
                  memberOf: {
                    '@type': 'Organization',
                    name: 'Socelle',
                  },
                };

                return (
                  <div
                    key={pro.id}
                    className="bg-white rounded-2xl border border-graphite/8 p-6 transition-all hover:shadow-sm hover:-translate-y-0.5"
                  >
                    <script
                      type="application/ld+json"
                      dangerouslySetInnerHTML={{
                        __html: JSON.stringify(personSchema),
                      }}
                    />
                    <div className="flex items-center gap-4 mb-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-sans font-semibold text-accent text-sm">
                          {getInitials(pro.spa_name)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-sans font-semibold text-graphite text-base truncate">
                          {displayName}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-xs font-sans font-medium text-graphite/50">
                            <Briefcase className="w-3 h-3" />
                            {roleLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {/* Verified badge */}
                      <div className="flex items-center gap-1.5">
                        <BadgeCheck className="w-3.5 h-3.5 text-signal-up" />
                        <span className="text-xs font-sans text-signal-up font-medium">
                          Verified member
                        </span>
                      </div>

                      {/* Member since */}
                      {memberSince && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-graphite/30" />
                          <span className="text-xs font-sans text-graphite/50">
                            Member since {memberSince}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Guest signup CTA ──────────────────────────────────── */}
        {!user && !loading && !error && (
          <div className="mt-12 bg-graphite rounded-2xl p-10 sm:p-12 text-center shadow-sm">
            <h2 className="font-sans font-semibold text-2xl text-white mb-4">
              Join the professional network
            </h2>
            <p className="font-sans text-white/55 mb-7 max-w-xl mx-auto text-sm leading-relaxed">
              Create your free account to access intelligence, protocols, and
              connect with verified beauty and wellness professionals.
            </p>
            <Link
              to="/request-access"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-sans font-medium tracking-wide hover:bg-white/25 transition-all duration-300"
            >
              Get Intelligence Access
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

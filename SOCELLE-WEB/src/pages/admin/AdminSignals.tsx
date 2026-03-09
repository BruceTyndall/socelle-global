import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Building2,
  Users,
  RefreshCw,
  ShieldAlert,
  Star,
  Target,
  Eye,
  Bell,
  HandshakeIcon,
  Award,
  MapPin,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ErrorState from '../../components/ErrorState';

// ── Types ──────────────────────────────────────────────────────────────────

interface BrandSignalRow {
  brand_id: string;
  brand_name: string;
  brand_slug: string;
  express_interest: number;
  notify_me: number;
  page_view: number;
  total: number;
}

interface BusinessSignalRow {
  business_id: string;
  business_name: string;
  business_slug: string;
  business_type: string | null;
  city: string | null;
  state: string | null;
  potential_fit: number;
  target_account: number;
  rep_visited: number;
  total: number;
}

type Tab = 'brands' | 'businesses';

// ── Helpers ────────────────────────────────────────────────────────────────

function SignalPill({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  color: string;
}) {
  if (count === 0) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium font-sans ${color}`}>
      <Icon className="w-3 h-3" />
      {count} {label}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return (
    <span className="w-7 h-7 rounded-full bg-accent-soft flex items-center justify-center text-xs font-bold text-graphite font-sans">
      {rank}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function AdminSignals() {
  const [tab, setTab] = useState<Tab>('brands');
  const [brandSignals, setBrandSignals] = useState<BrandSignalRow[]>([]);
  const [businessSignals, setBusinessSignals] = useState<BusinessSignalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSignals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ── Brand interest signals ──────────────────────────────────────────
      // Fetch all signals then group in JS (avoids needing a DB view)
      const [brandSigRes, bizSigRes] = await Promise.all([
        supabase
          .from('brand_interest_signals')
          .select('brand_id, signal_type, brands(name, slug)')
          .order('created_at', { ascending: false }),
        supabase
          .from('business_interest_signals')
          .select('business_id, signal_type, businesses(name, slug, business_type, city, state)')
          .order('created_at', { ascending: false }),
      ]);

      if (brandSigRes.error) throw brandSigRes.error;
      if (bizSigRes.error) throw bizSigRes.error;

      // Group brand signals
      const brandMap = new Map<string, BrandSignalRow>();
      for (const row of (brandSigRes.data ?? [])) {
        const b = row.brands as unknown as { name: string; slug: string } | null;
        if (!b) continue;
        if (!brandMap.has(row.brand_id)) {
          brandMap.set(row.brand_id, {
            brand_id: row.brand_id,
            brand_name: b.name,
            brand_slug: b.slug,
            express_interest: 0,
            notify_me: 0,
            page_view: 0,
            total: 0,
          });
        }
        const entry = brandMap.get(row.brand_id)!;
        if (row.signal_type === 'express_interest') entry.express_interest++;
        if (row.signal_type === 'notify_me') entry.notify_me++;
        if (row.signal_type === 'page_view') entry.page_view++;
        entry.total++;
      }
      const sortedBrands = [...brandMap.values()].sort((a, b) => b.total - a.total);

      // Group business signals
      const bizMap = new Map<string, BusinessSignalRow>();
      for (const row of (bizSigRes.data ?? [])) {
        const biz = row.businesses as unknown as { name: string; slug: string; business_type: string | null; city: string | null; state: string | null } | null;
        if (!biz) continue;
        if (!bizMap.has(row.business_id)) {
          bizMap.set(row.business_id, {
            business_id: row.business_id,
            business_name: biz.name,
            business_slug: biz.slug,
            business_type: biz.business_type,
            city: biz.city,
            state: biz.state,
            potential_fit: 0,
            target_account: 0,
            rep_visited: 0,
            total: 0,
          });
        }
        const entry = bizMap.get(row.business_id)!;
        if (row.signal_type === 'potential_fit') entry.potential_fit++;
        if (row.signal_type === 'target_account') entry.target_account++;
        if (row.signal_type === 'rep_visited') entry.rep_visited++;
        entry.total++;
      }
      const sortedBiz = [...bizMap.values()].sort((a, b) => b.total - a.total);

      setBrandSignals(sortedBrands);
      setBusinessSignals(sortedBiz);
    } catch (err: any) {
      console.error('Error loading signals:', err);
      setError('Failed to load interest signals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSignals();
  }, [loadSignals]);

  if (error) {
    return (
      <ErrorState
        icon={ShieldAlert}
        title="Signals Unavailable"
        message={error}
        action={{ label: 'Retry', onClick: loadSignals }}
      />
    );
  }

  const totalBrandSignals = brandSignals.reduce((acc, b) => acc + b.total, 0);
  const totalBizSignals = businessSignals.reduce((acc, b) => acc + b.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-sans text-graphite">
            Interest Signals<span className="text-accent">.</span>
          </h1>
          <p className="text-graphite/60 font-sans mt-1">
            Demand signals from resellers and brands — who's getting attention
          </p>
        </div>
        <button
          type="button"
          onClick={loadSignals}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft disabled:opacity-60 font-sans text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary chips */}
      {!loading && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white border border-accent-soft rounded-xl px-4 py-2.5">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-sm font-sans text-graphite">
              <strong>{totalBrandSignals}</strong> brand signals across{' '}
              <strong>{brandSignals.length}</strong> brands
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-accent-soft rounded-xl px-4 py-2.5">
            <Award className="w-4 h-4 text-accent" />
            <span className="text-sm font-sans text-graphite">
              <strong>{totalBizSignals}</strong> business signals across{' '}
              <strong>{businessSignals.length}</strong> businesses
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-accent-soft/40 rounded-xl p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab('brands')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors ${
            tab === 'brands'
              ? 'bg-white text-graphite shadow-sm'
              : 'text-graphite/60 hover:text-graphite'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Brand Demand
          {brandSignals.length > 0 && (
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
              tab === 'brands' ? 'bg-graphite text-white' : 'bg-accent-soft text-graphite'
            }`}>
              {brandSignals.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab('businesses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors ${
            tab === 'businesses'
              ? 'bg-white text-graphite shadow-sm'
              : 'text-graphite/60 hover:text-graphite'
          }`}
        >
          <Users className="w-4 h-4" />
          Business Pipeline
          {businessSignals.length > 0 && (
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
              tab === 'businesses' ? 'bg-graphite text-white' : 'bg-accent-soft text-graphite'
            }`}>
              {businessSignals.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LeaderboardSkeleton />
      ) : tab === 'brands' ? (
        <BrandLeaderboard rows={brandSignals} />
      ) : (
        <BusinessLeaderboard rows={businessSignals} />
      )}
    </div>
  );
}

// ── Brand leaderboard ──────────────────────────────────────────────────────

function BrandLeaderboard({ rows }: { rows: BrandSignalRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
        <TrendingUp className="w-12 h-12 text-accent-soft mx-auto mb-4" />
        <p className="text-graphite/60 font-sans text-sm">
          No brand interest signals yet. They'll appear here once resellers start browsing and expressing interest.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-accent-soft rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-accent-soft bg-accent-soft/50">
        <p className="text-xs font-bold uppercase tracking-widest text-graphite/60/70 font-sans">
          Brand Demand — Sorted by total signals
        </p>
      </div>
      <div className="divide-y divide-accent-soft">
        {rows.map((row, idx) => (
          <div key={row.brand_id} className="flex items-center gap-4 px-5 py-4">
            {/* Rank */}
            <div className="flex-shrink-0 w-8 flex items-center justify-center">
              <RankBadge rank={idx + 1} />
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-lg bg-graphite flex items-center justify-center flex-shrink-0">
              <span className="text-white font-sans text-lg font-bold">
                {row.brand_name.charAt(0)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-graphite font-sans truncate">{row.brand_name}</p>
              <p className="text-xs text-graphite/60 font-sans">/{row.brand_slug}</p>
            </div>

            {/* Signal pills */}
            <div className="hidden sm:flex flex-wrap gap-1.5 justify-end">
              <SignalPill
                icon={Star}
                label="express interest"
                count={row.express_interest}
                color="bg-accent/15 text-amber-700"
              />
              <SignalPill
                icon={Bell}
                label="notify me"
                count={row.notify_me}
                color="bg-blue-100 text-blue-700"
              />
              <SignalPill
                icon={Eye}
                label="page views"
                count={row.page_view}
                color="bg-accent-soft text-graphite"
              />
            </div>

            {/* Total */}
            <div className="flex-shrink-0 text-right ml-3">
              <p className="text-2xl font-sans text-graphite">{row.total}</p>
              <p className="text-xs text-graphite/60 font-sans">signals</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Business leaderboard ───────────────────────────────────────────────────

function BusinessLeaderboard({ rows }: { rows: BusinessSignalRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
        <Target className="w-12 h-12 text-accent-soft mx-auto mb-4" />
        <p className="text-graphite/60 font-sans text-sm">
          No business signals yet. Brands can flag businesses as potential fits or target accounts from the brand portal.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-accent-soft rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-accent-soft bg-accent-soft/50">
        <p className="text-xs font-bold uppercase tracking-widest text-graphite/60/70 font-sans">
          Business Pipeline — Sorted by brand attention
        </p>
      </div>
      <div className="divide-y divide-accent-soft">
        {rows.map((row, idx) => {
          const location = [row.city, row.state].filter(Boolean).join(', ');
          const typeLabel = row.business_type
            ? row.business_type === 'medspa' ? 'MedSpa' : row.business_type.charAt(0).toUpperCase() + row.business_type.slice(1)
            : null;
          return (
            <div key={row.business_id} className="flex items-center gap-4 px-5 py-4">
              {/* Rank */}
              <div className="flex-shrink-0 w-8 flex items-center justify-center">
                <RankBadge rank={idx + 1} />
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-lg bg-graphite flex items-center justify-center flex-shrink-0">
                <span className="text-white font-sans text-lg font-bold">
                  {row.business_name.charAt(0)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-graphite font-sans truncate">{row.business_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {typeLabel && (
                    <span className="text-xs text-graphite/60 font-sans">{typeLabel}</span>
                  )}
                  {location && (
                    <span className="flex items-center gap-1 text-xs text-graphite/60 font-sans">
                      {typeLabel && <span>·</span>}
                      <MapPin className="w-3 h-3" />
                      {location}
                    </span>
                  )}
                </div>
              </div>

              {/* Signal pills */}
              <div className="hidden sm:flex flex-wrap gap-1.5 justify-end">
                <SignalPill
                  icon={HandshakeIcon}
                  label="potential fit"
                  count={row.potential_fit}
                  color="bg-green-100 text-green-700"
                />
                <SignalPill
                  icon={Target}
                  label="target acct"
                  count={row.target_account}
                  color="bg-accent/15 text-amber-700"
                />
                <SignalPill
                  icon={Users}
                  label="rep visited"
                  count={row.rep_visited}
                  color="bg-blue-100 text-blue-700"
                />
              </div>

              {/* Total */}
              <div className="flex-shrink-0 text-right ml-3">
                <p className="text-2xl font-sans text-graphite">{row.total}</p>
                <p className="text-xs text-graphite/60 font-sans">signals</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function LeaderboardSkeleton() {
  return (
    <div className="bg-white border border-accent-soft rounded-xl overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-accent-soft bg-accent-soft/50">
        <div className="h-3 bg-accent-soft rounded w-48" />
      </div>
      <div className="divide-y divide-accent-soft">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="w-8 h-8 rounded-full bg-accent-soft flex-shrink-0" />
            <div className="w-10 h-10 rounded-lg bg-accent-soft flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-accent-soft rounded w-1/3" />
              <div className="h-3 bg-accent-soft rounded w-1/4" />
            </div>
            <div className="w-12 h-8 bg-accent-soft rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

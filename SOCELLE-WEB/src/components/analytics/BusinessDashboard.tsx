import { useEffect, useState } from 'react';
import { ArrowRight, AlertCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBusinessAnalytics, type BusinessAnalyticsData } from '../../lib/analyticsService';
import SparklineChart from './SparklineChart';
import { createScopedLogger } from '../../lib/logger';

const log = createScopedLogger('BusinessDashboard');

const PRIORITY_COLORS: Record<string, string> = {
  high:   'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low:    'bg-accent-soft text-graphite/60 border-accent-soft',
};

interface BusinessDashboardProps {
  businessId: string;
}

export default function BusinessDashboard({ businessId }: BusinessDashboardProps) {
  const [data, setData] = useState<BusinessAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;
    getBusinessAnalytics(businessId)
      .then(setData)
      .catch((err) => log.error('Failed to load business analytics', { err }))
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card p-5 space-y-3">
          <div className="skeleton h-4 w-48 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-3/4 rounded" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <div key={i} className="card p-5 skeleton h-40" />)}
        </div>
      </div>
    );
  }

  if (!data) return (
    <div className="text-center py-10 text-graphite/60 font-sans text-sm">
      Analytics data not available yet.
    </div>
  );

  const { menuCoverage, gaps, retailRevenueTrend, quickActions } = data;
  const formatCurrency = (v: number | null) =>
    v != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v) : '—';

  return (
    <div className="space-y-6">
      {/* ── Menu coverage ─────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-sans font-semibold text-graphite text-sm">
            Service Menu Coverage
          </h3>
          <span className="font-sans text-xs text-graphite/60">
            {menuCoverage.matched} of {menuCoverage.total} services matched
          </span>
        </div>
        <div className="relative h-4 bg-accent-soft rounded-full overflow-hidden mb-2">
          <div
            className="absolute inset-y-0 left-0 bg-graphite rounded-full transition-all duration-700"
            style={{ width: `${menuCoverage.percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="font-sans text-2xl text-graphite">{menuCoverage.percentage}%</span>
          {menuCoverage.percentage < 100 && (
            <Link
              to="/portal/plans/new"
              className="text-xs font-medium font-sans text-accent hover:text-accent-light transition-colors flex items-center gap-1"
            >
              Upload menu to improve <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Gap analysis ──────────────────────────────────── */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-accent-soft flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-graphite/60" />
            <h3 className="font-sans font-semibold text-graphite text-sm">
              Gap Analysis
            </h3>
          </div>
          {gaps.length === 0 ? (
            <div className="px-5 py-6 text-center text-graphite/60 font-sans text-sm">
              No gaps found — great coverage!
            </div>
          ) : (
            <div className="divide-y divide-accent-soft">
              {gaps.slice(0, 5).map((gap, i) => (
                <div key={i} className="px-5 py-3">
                  <div className="flex items-start gap-2 mb-1">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border font-sans flex-shrink-0 mt-0.5 ${PRIORITY_COLORS[gap.priority] ?? PRIORITY_COLORS.low}`}>
                      {gap.priority}
                    </span>
                    <p className="font-sans text-sm text-graphite leading-snug">{gap.description}</p>
                  </div>
                  {gap.revenue_estimate != null && (
                    <p className="font-sans text-xs text-graphite/60 ml-9">
                      Est. opportunity: {formatCurrency(gap.revenue_estimate)}/yr
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Retail revenue ────────────────────────────────── */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-graphite/60" />
            <h3 className="font-sans font-semibold text-graphite text-sm">
              Retail Revenue — Last 30 Days
            </h3>
          </div>
          <SparklineChart data={retailRevenueTrend} color="var(--color-warn)" height={120} />
        </div>
      </div>

      {/* ── Quick actions ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action, i) => {
          const hrefs = ['/portal/plans/new', '/brands', '/portal/plans'];
          return (
            <Link
              key={action}
              to={hrefs[i] ?? '/portal'}
              className="card p-4 text-center hover:bg-accent-soft transition-colors group"
            >
              <p className="font-sans text-sm font-medium text-graphite group-hover:text-graphite transition-colors">
                {action}
              </p>
              <ArrowRight className="w-4 h-4 text-graphite/60 group-hover:text-graphite transition-colors mx-auto mt-1" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

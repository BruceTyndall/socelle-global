import { useEffect, useState } from 'react';
import { DollarSign, Package, Users, ShoppingBag, Clock } from 'lucide-react';
import { getAdminAnalytics, type AdminAnalyticsData } from '../../lib/analyticsService';
import SparklineChart from './SparklineChart';
import { createScopedLogger } from '../../lib/logger';

const log = createScopedLogger('AdminDashboard');

function HealthCard({
  label,
  value,
  icon,
  format = 'number',
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  format?: 'number' | 'currency';
}) {
  const display =
    format === 'currency'
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
      : new Intl.NumberFormat('en-US').format(value);

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="font-sans text-xs font-medium text-pro-warm-gray uppercase tracking-wide">{label}</p>
        <span className="text-pro-warm-gray">{icon}</span>
      </div>
      <p className="font-serif text-2xl text-pro-navy">{display}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminAnalytics()
      .then(setData)
      .catch((err) => log.error('Failed to load admin analytics', { err }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-7 w-24 rounded" />
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-5 skeleton h-48" />
          <div className="card p-5 skeleton h-48" />
        </div>
      </div>
    );
  }

  if (!data) return (
    <div className="text-center py-10 text-pro-warm-gray font-sans text-sm">
      Admin analytics not available.
    </div>
  );

  const { platformHealth, dauMauTrend, registrationsByWeek, recentAuditLog } = data;

  return (
    <div className="space-y-6">
      {/* ── Platform health ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <HealthCard label="Total GMV"          value={platformHealth.totalGmv}         format="currency" icon={<DollarSign className="w-4 h-4" />} />
        <HealthCard label="Active Brands"      value={platformHealth.activeBrands}                       icon={<Package className="w-4 h-4" />} />
        <HealthCard label="Active Businesses"  value={platformHealth.activeBusinesses}                   icon={<Users className="w-4 h-4" />} />
        <HealthCard label="Total Orders"       value={platformHealth.totalOrders}                        icon={<ShoppingBag className="w-4 h-4" />} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── DAU/MAU trend ──────────────────────────────────── */}
        <div className="card p-5">
          <h3 className="font-sans font-semibold text-pro-charcoal text-sm mb-4">
            DAU — Last 30 Days
          </h3>
          <SparklineChart data={dauMauTrend} color="var(--color-accent)" height={130} />
        </div>

        {/* ── New registrations ──────────────────────────────── */}
        <div className="card p-5">
          <h3 className="font-sans font-semibold text-pro-charcoal text-sm mb-4">
            New Registrations — By Week
          </h3>
          <SparklineChart data={registrationsByWeek} color="var(--color-warn)" height={130} />
        </div>
      </div>

      {/* ── Recent audit log ────────────────────────────────────── */}
      {recentAuditLog.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-pro-stone flex items-center gap-2">
            <Clock className="w-4 h-4 text-pro-warm-gray" />
            <h3 className="font-sans font-semibold text-pro-charcoal text-sm">Recent Audit Log</h3>
          </div>
          <div className="divide-y divide-pro-stone">
            {recentAuditLog.slice(0, 10).map((entry, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm text-pro-charcoal">{entry.action}</p>
                  <p className="font-sans text-xs text-pro-warm-gray">
                    {entry.actor.slice(0, 8)}…
                  </p>
                </div>
                <p className="font-sans text-xs text-pro-warm-gray">
                  {new Date(entry.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

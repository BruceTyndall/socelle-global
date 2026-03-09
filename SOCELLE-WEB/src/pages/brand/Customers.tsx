import { useEffect, useState } from 'react';
import { Search, Users, MapPin, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge, Input, EmptyState, StatCard, Avatar } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface Retailer {
  id: string;
  name: string;
  type: string | null;
  location: string | null;
  planCount: number;
  orderCount: number;
  totalSpend: number;
  firstSeen: string;
}

const STATUS_BADGE = {
  active:   { variant: 'green' as const, label: 'Active' },
  new:      { variant: 'amber' as const, label: 'New' },
  inactive: { variant: 'gray' as const, label: 'Inactive' },
};

function getRetailerStatus(r: Retailer): keyof typeof STATUS_BADGE {
  if (r.orderCount > 0) return 'active';
  if (r.planCount > 0) return 'new';
  return 'inactive';
}

export default function BrandCustomers() {
  const { brandId } = useAuth();
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'new' | 'inactive'>('all');

  useEffect(() => {
    if (brandId) fetchRetailers();
    else setLoading(false);
  }, [brandId]);

  const fetchRetailers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get plans for this brand + join businesses
      const { data: plans, error: plansErr } = await supabase
        .from('plans')
        .select('business_id, created_at, businesses!inner(id, name, type, location)')
        .eq('brand_id', brandId!);

      if (plansErr) throw plansErr;

      // Aggregate by business_id
      const businessMap = new Map<string, Retailer>();

      for (const plan of plans ?? []) {
        const biz = plan.businesses as unknown as { id: string; name: string; type: string | null; location: string | null };
        if (!biz?.id) continue;

        if (!businessMap.has(biz.id)) {
          businessMap.set(biz.id, {
            id: biz.id,
            name: biz.name,
            type: biz.type,
            location: biz.location,
            planCount: 1,
            orderCount: 0,
            totalSpend: 0,
            firstSeen: plan.created_at,
          });
        } else {
          const existing = businessMap.get(biz.id)!;
          existing.planCount += 1;
          // keep earliest date
          if (plan.created_at < existing.firstSeen) existing.firstSeen = plan.created_at;
        }
      }

      // Fetch order aggregates per business for this brand
      if (businessMap.size > 0) {
        const businessIds = Array.from(businessMap.keys());
        const { data: orders } = await supabase
          .from('orders')
          .select('business_id, subtotal, status')
          .eq('brand_id', brandId!)
          .in('business_id', businessIds)
          .neq('status', 'cancelled');

        for (const order of orders ?? []) {
          if (!order.business_id) continue;
          const r = businessMap.get(order.business_id);
          if (r) {
            r.orderCount += 1;
            r.totalSpend += order.subtotal || 0;
          }
        }
      }

      setRetailers(Array.from(businessMap.values()).sort((a, b) => b.totalSpend - a.totalSpend));
    } catch (err: any) {
      console.warn('Customers fetch error:', err);
      setError('Unable to load retailer data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = retailers.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.location ?? '').toLowerCase().includes(search.toLowerCase());
    const status = getRetailerStatus(r);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const active = retailers.filter(r => getRetailerStatus(r) === 'active').length;
  const totalRevenue = retailers.reduce((s, r) => s + r.totalSpend, 0);
  const avgSpend = active > 0
    ? Math.round(retailers.filter(r => r.totalSpend > 0).reduce((s, r) => s + r.totalSpend, 0) / Math.max(active, 1))
    : 0;
  const pending = retailers.filter(r => getRetailerStatus(r) === 'new').length;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-graphite/60 font-sans">No brand associated with your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl text-graphite">Retailers</h1>
          <p className="text-sm text-graphite/60 font-sans mt-0.5">Businesses exploring or ordering your brand</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Retailers" value={active} />
        <StatCard label="Total Revenue" value={totalRevenue >= 1000 ? `$${(totalRevenue / 1000).toFixed(1)}k` : `$${totalRevenue}`} />
        <StatCard label="Avg Order Value" value={avgSpend > 0 ? `$${avgSpend.toLocaleString()}` : '—'} />
        <StatCard label="New (No Orders)" value={pending} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 font-sans text-sm flex-1">{error}</p>
          <button onClick={fetchRetailers} className="flex items-center gap-1.5 text-red-600 text-sm font-medium hover:text-red-800">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-accent-soft">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-accent-soft">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search retailers or location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              iconLeft={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'active', 'new', 'inactive'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans capitalize transition-colors ${
                  statusFilter === s ? 'bg-graphite text-white' : 'bg-accent-soft/50 text-graphite/60 hover:text-graphite'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-accent-soft/50">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-accent-soft/30" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-accent-soft/30 rounded w-48" />
                  <div className="h-3 bg-accent-soft/30 rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={retailers.length === 0 ? 'No retailers yet' : 'No retailers found'}
            description={
              retailers.length === 0
                ? 'Retailers will appear here once they create a plan for your brand.'
                : 'Try adjusting your search or filter.'
            }
          />
        ) : (
          <div className="divide-y divide-accent-soft/50">
            {filtered.map(r => {
              const statusKey = getRetailerStatus(r);
              const { variant, label } = STATUS_BADGE[statusKey];
              return (
                <div key={r.id} className="flex items-center gap-4 p-4 hover:bg-background/50 transition-colors group cursor-pointer">
                  <Avatar name={r.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-graphite font-sans">{r.name}</p>
                      <Badge variant={variant} dot>{label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {r.type && <span className="text-xs text-graphite/60 font-sans">{r.type}</span>}
                      {r.location && (
                        <span className="flex items-center gap-1 text-xs text-graphite/60 font-sans">
                          <MapPin className="w-3 h-3" />{r.location}
                        </span>
                      )}
                      <span className="text-xs text-graphite/60 font-sans">
                        Since {formatDate(r.firstSeen)}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-right text-sm">
                    <div>
                      <p className="text-xs text-graphite/60 font-sans">Plans</p>
                      <p className="font-semibold text-graphite font-sans">{r.planCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-graphite/60 font-sans">Orders</p>
                      <p className="font-semibold text-graphite font-sans">{r.orderCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-graphite/60 font-sans">Revenue</p>
                      <p className="font-semibold text-graphite font-sans">
                        {r.totalSpend > 0 ? `$${r.totalSpend.toLocaleString()}` : '—'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-accent-soft group-hover:text-graphite/60 transition-colors flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

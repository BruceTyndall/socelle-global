import { useParams } from 'react-router-dom';
import { Users, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge, EmptyState, StatCard, Avatar } from '../../../components/ui';
import { supabase } from '../../../lib/supabase';

interface Retailer {
  business_id: string;
  name: string;
  type: string | null;
  city: string | null;
  state: string | null;
  verification_status: string | null;
  order_count: number;
  total_spend: number;
  last_order_at: string | null;
}

export default function HubRetailers() {
  const { id: brandId } = useParams<{ id: string }>();

  const { data: retailers = [], isLoading: loading } = useQuery({
    queryKey: ['admin', 'brand-hub-retailers', brandId],
    queryFn: async () => {
      // Fetch all orders for this brand, grouped by business
      const { data: orders } = await supabase
        .from('orders')
        .select('business_id, total_amount, created_at, businesses!inner(name, type, city, state, verification_status)')
        .eq('brand_id', brandId!)
        .not('business_id', 'is', null);

      const bizMap = new Map<string, Retailer>();
      for (const o of orders ?? []) {
        const biz = o.businesses as unknown as { name: string; type: string | null; city: string | null; state: string | null; verification_status: string | null };
        const key = o.business_id as string;
        if (!bizMap.has(key)) {
          bizMap.set(key, {
            business_id: key,
            name: biz.name,
            type: biz.type,
            city: biz.city,
            state: biz.state,
            verification_status: biz.verification_status,
            order_count: 0,
            total_spend: 0,
            last_order_at: null,
          });
        }
        const r = bizMap.get(key)!;
        r.order_count += 1;
        r.total_spend += o.total_amount ?? 0;
        if (!r.last_order_at || o.created_at > r.last_order_at) {
          r.last_order_at = o.created_at;
        }
      }

      return Array.from(bizMap.values()).sort((a, b) => b.total_spend - a.total_spend);
    },
    enabled: !!brandId,
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white rounded-xl border border-accent-soft animate-pulse" />)}
        </div>
        <div className="h-48 bg-white rounded-xl border border-accent-soft animate-pulse" />
      </div>
    );
  }

  const totalSpend = retailers.reduce((s, r) => s + r.total_spend, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Retailers" value={retailers.length} />
        <StatCard label="Verified"        value={retailers.filter(r => r.verification_status === 'verified').length} />
        <StatCard label="Total Revenue"   value={`$${(totalSpend / 1000).toFixed(1)}k`} />
      </div>

      <div className="bg-white rounded-xl border border-accent-soft divide-y divide-accent-soft/50">
        {retailers.length === 0 ? (
          <EmptyState icon={Users} title="No retailers yet" description="Retailers who have placed orders for this brand will appear here." />
        ) : retailers.map(r => (
          <div key={r.business_id} className="flex items-center gap-4 p-4 hover:bg-background/50 transition-colors">
            <Avatar name={r.name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-graphite font-sans">{r.name}</p>
                {r.verification_status === 'verified' ? (
                  <Badge variant="green" dot>Verified</Badge>
                ) : r.verification_status === 'pending_verification' ? (
                  <Badge variant="amber" dot>Pending</Badge>
                ) : (
                  <Badge variant="gray" dot>Unverified</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-graphite/60 font-sans mt-0.5">
                {r.type && <span>{r.type}</span>}
                {(r.city || r.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {[r.city, r.state].filter(Boolean).join(', ')}
                  </span>
                )}
                {r.last_order_at && (
                  <span>
                    Last order {new Date(r.last_order_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-graphite font-sans text-sm">
                ${r.total_spend.toLocaleString()}
              </p>
              <p className="text-xs text-graphite/60 font-sans">
                {r.order_count} {r.order_count === 1 ? 'order' : 'orders'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

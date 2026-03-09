import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { StatCard, Badge, Table, TableHead, TableBody, TableRow, Th, Td, EmptyState } from '../../../components/ui';
import { supabase } from '../../../lib/supabase';

interface Order {
  id: string;
  status: string;
  total_amount: number | null;
  created_at: string;
  business_name: string;
  item_count: number;
}

const STATUS: Record<string, { variant: 'green' | 'amber' | 'gray' | 'red'; label: string }> = {
  delivered:  { variant: 'green', label: 'Delivered' },
  shipped:    { variant: 'green', label: 'Shipped' },
  fulfilled:  { variant: 'green', label: 'Fulfilled' },
  confirmed:  { variant: 'amber', label: 'Confirmed' },
  processing: { variant: 'amber', label: 'Processing' },
  pending:    { variant: 'gray',  label: 'Pending' },
  cancelled:  { variant: 'red',   label: 'Cancelled' },
};

export default function HubOrders() {
  const { id: brandId } = useParams<{ id: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brandId) return;
    (async () => {
      try {
        const { data } = await supabase
          .from('orders')
          .select(`
            id, status, total_amount, created_at,
            businesses!inner(name),
            order_items(id)
          `)
          .eq('brand_id', brandId)
          .order('created_at', { ascending: false })
          .limit(100);

        setOrders((data ?? []).map((o: any) => ({
          id: o.id,
          status: o.status ?? 'pending',
          total_amount: o.total_amount,
          created_at: o.created_at,
          business_name: (o.businesses as { name: string })?.name ?? 'Unknown',
          item_count: Array.isArray(o.order_items) ? o.order_items.length : 0,
        })));
      } finally {
        setLoading(false);
      }
    })();
  }, [brandId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white rounded-xl border border-accent-soft animate-pulse" />)}
        </div>
        <div className="h-48 bg-white rounded-xl border border-accent-soft animate-pulse" />
      </div>
    );
  }

  const total     = orders.reduce((s, o) => s + (o.total_amount ?? 0), 0);
  const pending   = orders.filter(o => ['pending', 'processing', 'confirmed'].includes(o.status)).length;
  const avgOrder  = orders.length > 0 ? Math.round(total / orders.length) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={orders.length} />
        <StatCard label="Revenue"      value={`$${(total / 1000).toFixed(1)}k`} />
        <StatCard label="Pending"      value={pending} />
        <StatCard label="Avg Order"    value={avgOrder > 0 ? `$${avgOrder.toLocaleString()}` : '—'} />
      </div>

      <div className="bg-white rounded-xl border border-accent-soft">
        {orders.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="No orders yet" description="Orders placed by retailers for this brand will appear here." />
        ) : (
          <Table>
            <TableHead>
              <tr>
                <Th>Order ID</Th>
                <Th>Retailer</Th>
                <Th>Date</Th>
                <Th>Items</Th>
                <Th>Total</Th>
                <Th>Status</Th>
              </tr>
            </TableHead>
            <TableBody>
              {orders.map(o => {
                const s = STATUS[o.status] ?? { variant: 'gray' as const, label: o.status };
                return (
                  <TableRow key={o.id}>
                    <Td>
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="font-mono text-xs text-graphite hover:underline"
                      >
                        {o.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </Td>
                    <Td className="font-medium">{o.business_name}</Td>
                    <Td className="text-graphite/60">
                      {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Td>
                    <Td>{o.item_count}</Td>
                    <Td className="font-semibold">
                      {o.total_amount != null ? `$${o.total_amount.toLocaleString()}` : '—'}
                    </Td>
                    <Td><Badge variant={s.variant} dot>{s.label}</Badge></Td>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

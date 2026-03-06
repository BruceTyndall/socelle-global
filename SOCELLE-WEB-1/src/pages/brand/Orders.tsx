import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Eye, Package, AlertCircle, RefreshCw } from 'lucide-react';
import { StatCard, Badge, Table, TableHead, TableBody, TableRow, Th, Td, Input, Button, EmptyState } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

type OrderStatus = 'submitted' | 'reviewing' | 'sent_to_brand' | 'confirmed' | 'fulfilled' | 'cancelled';

interface Order {
  id: string;
  order_number: string;
  business_id: string | null;
  status: OrderStatus;
  subtotal: number;
  created_at: string;
  businesses: { name: string; type: string } | null;
  item_count: number;
}

const STATUS_BADGE: Record<OrderStatus, { variant: 'green' | 'amber' | 'navy' | 'gray' | 'red'; label: string }> = {
  fulfilled:    { variant: 'green', label: 'Fulfilled' },
  confirmed:    { variant: 'navy', label: 'Confirmed' },
  sent_to_brand:{ variant: 'amber', label: 'Sent to Brand' },
  reviewing:    { variant: 'amber', label: 'Reviewing' },
  submitted:    { variant: 'gray', label: 'Submitted' },
  cancelled:    { variant: 'red', label: 'Cancelled' },
};

const STATUS_FILTERS = ['all', 'submitted', 'reviewing', 'sent_to_brand', 'confirmed', 'fulfilled', 'cancelled'] as const;

export default function BrandOrders() {
  const { brandId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (brandId) fetchOrders();
    else setLoading(false);
  }, [brandId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          business_id,
          status,
          subtotal,
          created_at,
          businesses ( name, type )
        `)
        .eq('brand_id', brandId!)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch item counts separately to avoid RLS complexity
      const orderList = data || [];
      const countsResult = await Promise.all(
        orderList.map(o =>
          supabase
            .from('order_items')
            .select('id', { count: 'exact', head: true })
            .eq('order_id', o.id)
        )
      );

      const enriched: Order[] = orderList.map((o, i) => ({
        id: o.id,
        order_number: o.order_number,
        business_id: o.business_id,
        status: o.status as OrderStatus,
        subtotal: o.subtotal || 0,
        created_at: o.created_at,
        businesses: o.businesses as unknown as { name: string; type: string } | null,
        item_count: countsResult[i]?.count ?? 0,
      }));

      setOrders(enriched);
    } catch (err: any) {
      console.warn('Orders fetch error:', err);
      setError('Unable to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o => {
    const name = o.businesses?.name ?? '';
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      o.order_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeOrders = orders.filter(o => o.status !== 'cancelled');
  const totalRevenue = activeOrders.reduce((s, o) => s + o.subtotal, 0);
  const pendingCount = orders.filter(o => o.status === 'submitted' || o.status === 'reviewing').length;
  const avgValue = activeOrders.length > 0 ? Math.round(totalRevenue / activeOrders.length) : 0;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-pro-warm-gray font-sans">No brand associated with your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-pro-navy">Orders</h1>
          <p className="text-sm text-pro-warm-gray font-sans mt-0.5">Manage retailer purchase orders</p>
        </div>
        <Button variant="outline" size="sm" iconLeft={<Download className="w-4 h-4" />}>
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={orders.length} />
        <StatCard label="Revenue" value={totalRevenue >= 1000 ? `$${(totalRevenue / 1000).toFixed(1)}k` : `$${totalRevenue}`} />
        <StatCard label="Pending Action" value={pendingCount} />
        <StatCard label="Avg Order Value" value={`$${avgValue.toLocaleString()}`} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 font-sans text-sm">{error}</p>
          </div>
          <button onClick={fetchOrders} className="flex items-center gap-1.5 text-red-600 text-sm font-medium font-sans hover:text-red-800">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-pro-stone">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-pro-stone">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search orders or businesses…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              iconLeft={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans capitalize transition-colors ${
                  statusFilter === s
                    ? 'bg-pro-navy text-white'
                    : 'bg-pro-stone/50 text-pro-warm-gray hover:text-pro-charcoal'
                }`}
              >
                {s === 'sent_to_brand' ? 'Sent' : s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-pro-stone/50">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-24 h-4 bg-pro-stone/50 rounded" />
                <div className="flex-1 h-4 bg-pro-stone/50 rounded" />
                <div className="w-16 h-4 bg-pro-stone/50 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title={orders.length === 0 ? 'No orders yet' : 'No orders found'}
            description={
              orders.length === 0
                ? 'Orders from retailers will appear here once submitted.'
                : 'Try adjusting your filters or search term.'
            }
          />
        ) : (
          <Table>
            <TableHead>
              <tr>
                <Th>Order</Th>
                <Th>Retailer</Th>
                <Th>Date</Th>
                <Th>Items</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th></Th>
              </tr>
            </TableHead>
            <TableBody>
              {filtered.map(order => {
                const badge = STATUS_BADGE[order.status] ?? { variant: 'gray' as const, label: order.status };
                return (
                  <TableRow key={order.id}>
                    <Td className="font-mono text-xs text-pro-warm-gray">{order.order_number}</Td>
                    <Td>
                      <div>
                        <p className="font-medium text-pro-charcoal">
                          {order.businesses?.name ?? 'Unknown Retailer'}
                        </p>
                        <p className="text-xs text-pro-warm-gray">{order.businesses?.type ?? '—'}</p>
                      </div>
                    </Td>
                    <Td className="text-pro-warm-gray text-sm">{formatDate(order.created_at)}</Td>
                    <Td className="text-pro-charcoal">
                      {order.item_count > 0 ? `${order.item_count} items` : '—'}
                    </Td>
                    <Td className="font-semibold text-pro-charcoal">${order.subtotal.toLocaleString()}</Td>
                    <Td><Badge variant={badge.variant} dot>{badge.label}</Badge></Td>
                    <Td>
                      <Link
                        to={`/brand/orders/${order.id}`}
                        className="inline-flex p-1.5 rounded-lg text-pro-warm-gray hover:text-pro-navy hover:bg-pro-cream transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Td>
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
